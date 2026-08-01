-- Photos. Two kinds, deliberately separate:
--   recipes.image_path   -- the dish at its best, the "hero" shot
--   cook_logs.image_path -- how *this* attempt actually turned out
-- The second is the interesting one: it turns cook history into a visual
-- record of a dish getting better over time.

alter table recipes add column image_path text;
alter table cook_logs add column image_path text;

-- Objects are keyed <household_id>/<uuid>.<ext> so membership is checkable
-- straight off the first path segment.
--
-- Public read is deliberate, and matches the threat model recipe_shares
-- already established: recipes are shareable to logged-out guests via an
-- unguessable token, and these paths carry an unguessable uuid too. Writes
-- stay locked to household members.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recipe-photos',
  'recipe-photos',
  true,
  10485760, -- 10MB; the client downscales well below this before uploading
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Wrapper so a malformed object name is denied cleanly instead of raising
-- on a bad uuid cast mid-policy.
create or replace function public.owns_photo_path(p_path text)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_household_id uuid;
begin
  begin
    v_household_id := split_part(p_path, '/', 1)::uuid;
  exception when others then
    return false;
  end;

  return public.is_household_member(v_household_id);
end;
$$;

grant execute on function public.owns_photo_path(text) to authenticated;

create policy "recipe photos: members can upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'recipe-photos' and public.owns_photo_path(name));

create policy "recipe photos: members can replace"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'recipe-photos' and public.owns_photo_path(name));

create policy "recipe photos: members can delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'recipe-photos' and public.owns_photo_path(name));

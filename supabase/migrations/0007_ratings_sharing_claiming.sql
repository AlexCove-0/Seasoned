-- Per-person recipe ratings: distinct from cook_logs (a per-cook journal
-- entry). This is "how does this person feel about the dish overall,"
-- updatable over time, averaged across everyone who's rated it.
create table recipe_ratings (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes (id) on delete cascade,
  member_id uuid not null references household_members (id) on delete cascade,
  rating numeric(2,1) not null,
  comment text,
  created_by uuid not null references auth.users (id),
  updated_at timestamptz not null default now(),
  unique (recipe_id, member_id),
  constraint recipe_ratings_half_star check (rating >= 0.5 and rating <= 5 and mod(rating * 10, 5) = 0)
);

alter table recipe_ratings enable row level security;

create policy "recipe_ratings: members can select"
  on recipe_ratings for select
  using (exists (select 1 from recipes where recipes.id = recipe_ratings.recipe_id and is_household_member(recipes.household_id)));

create policy "recipe_ratings: members can insert"
  on recipe_ratings for insert
  to authenticated
  with check (created_by = auth.uid() and exists (select 1 from recipes where recipes.id = recipe_ratings.recipe_id and is_household_member(recipes.household_id)));

create policy "recipe_ratings: members can update"
  on recipe_ratings for update
  using (exists (select 1 from recipes where recipes.id = recipe_ratings.recipe_id and is_household_member(recipes.household_id)));

grant select, insert, update, delete on recipe_ratings to authenticated;

-- Lets someone joining via invite code claim an existing no-login profile
-- (e.g. Cris signs up for real and takes over her existing profile) instead
-- of always creating a brand new one. Security definer because the joiner
-- isn't a household member yet at the moment they're joining -- same
-- bootstrap problem household creation had.
create or replace function claim_household_profile(p_invite_code text, p_member_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
begin
  select id into v_household_id from households where invite_code = p_invite_code;
  if v_household_id is null then
    raise exception 'Invalid invite code';
  end if;

  update household_members
  set user_id = auth.uid()
  where id = p_member_id
    and household_id = v_household_id
    and user_id is null;

  if not found then
    raise exception 'That profile is not available to claim';
  end if;

  return v_household_id;
end;
$$;

grant execute on function claim_household_profile(text, uuid) to authenticated;

create or replace function unclaimed_profiles_for_invite_code(p_invite_code text)
returns table (id uuid, display_name text)
language sql
security definer
set search_path = public
stable
as $$
  select hm.id, hm.display_name
  from household_members hm
  join households h on h.id = hm.household_id
  where h.invite_code = p_invite_code and hm.user_id is null;
$$;

grant execute on function unclaimed_profiles_for_invite_code(text) to authenticated;

-- External sharing: a household member creates a share link for a recipe;
-- anyone with the link (no account needed) can view it and leave a rating
-- and comment.
create table recipe_shares (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes (id) on delete cascade,
  share_token text not null unique,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

alter table recipe_shares enable row level security;

create policy "recipe_shares: members can select"
  on recipe_shares for select
  using (exists (select 1 from recipes where recipes.id = recipe_shares.recipe_id and is_household_member(recipes.household_id)));

create policy "recipe_shares: members can insert"
  on recipe_shares for insert
  to authenticated
  with check (created_by = auth.uid() and exists (select 1 from recipes where recipes.id = recipe_shares.recipe_id and is_household_member(recipes.household_id)));

create policy "recipe_shares: members can delete"
  on recipe_shares for delete
  using (exists (select 1 from recipes where recipes.id = recipe_shares.recipe_id and is_household_member(recipes.household_id)));

grant select, insert, delete on recipe_shares to authenticated;

create table guest_ratings (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes (id) on delete cascade,
  share_token text not null,
  guest_name text not null,
  rating numeric(2,1) not null,
  comment text,
  created_at timestamptz not null default now(),
  constraint guest_ratings_half_star check (rating >= 0.5 and rating <= 5 and mod(rating * 10, 5) = 0)
);

alter table guest_ratings enable row level security;

create policy "guest_ratings: members can select"
  on guest_ratings for select
  using (exists (select 1 from recipes where recipes.id = guest_ratings.recipe_id and is_household_member(recipes.household_id)));

grant select on guest_ratings to authenticated;

-- Public, narrow RPCs for the share link -- callable with no login at all.
-- Deliberately not opening RLS to the anon role directly; these two
-- functions are the entire public surface area.
create or replace function get_shared_recipe(p_token text)
returns table (
  recipe_id uuid, title text, ingredients jsonb, steps jsonb, base_servings int,
  avg_rating numeric, rating_count int
)
language sql
security definer
set search_path = public
stable
as $$
  select r.id, r.title, r.ingredients, r.steps, r.base_servings,
    (select avg(x.rating) from (
      select rating from recipe_ratings where recipe_id = r.id
      union all
      select rating from guest_ratings where recipe_id = r.id
    ) x),
    (select count(*) from (
      select rating from recipe_ratings where recipe_id = r.id
      union all
      select rating from guest_ratings where recipe_id = r.id
    ) x)
  from recipes r
  join recipe_shares rs on rs.recipe_id = r.id
  where rs.share_token = p_token;
$$;

grant execute on function get_shared_recipe(text) to anon, authenticated;

create or replace function submit_guest_rating(p_token text, p_name text, p_rating numeric, p_comment text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recipe_id uuid;
begin
  select recipe_id into v_recipe_id from recipe_shares where share_token = p_token;
  if v_recipe_id is null then
    raise exception 'Invalid share link';
  end if;
  if p_rating < 0.5 or p_rating > 5 or mod(p_rating * 10, 5) <> 0 then
    raise exception 'Rating must be between 0.5 and 5 in half-star steps';
  end if;

  insert into guest_ratings (recipe_id, share_token, guest_name, rating, comment)
  values (v_recipe_id, p_token, p_name, p_rating, p_comment);
end;
$$;

grant execute on function submit_guest_rating(text, text, numeric, text) to anon, authenticated;

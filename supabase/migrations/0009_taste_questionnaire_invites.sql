-- Lets a household member send someone a link to fill out their own taste
-- profile before they have an account (e.g. inviting a parent or kid who
-- isn't ready to sign up yet). One stable token per member; the token
-- alone is the auth for this narrow public surface, same trust model as
-- recipe_shares.share_token in 0007.
alter table household_members add column invite_token uuid not null default gen_random_uuid() unique;

create or replace function get_invite_target(p_token uuid)
returns table (member_id uuid, display_name text, household_name text, already_claimed boolean)
language sql
security definer
set search_path = public
stable
as $$
  select hm.id, hm.display_name, h.name, hm.user_id is not null
  from household_members hm
  join households h on h.id = hm.household_id
  where hm.invite_token = p_token;
$$;

grant execute on function get_invite_target(uuid) to anon, authenticated;

-- Restricted to unclaimed profiles (user_id is null) so a link that leaks
-- after someone has already signed up can't be used to overwrite their
-- real profile.
create or replace function submit_taste_questionnaire(
  p_token uuid, p_taste_preferences text[], p_disliked_tastes text[], p_allergies text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update household_members
  set taste_preferences = p_taste_preferences,
      disliked_tastes = p_disliked_tastes,
      allergies = p_allergies
  where invite_token = p_token
    and user_id is null;

  if not found then
    raise exception 'This invite link is no longer valid';
  end if;
end;
$$;

grant execute on function submit_taste_questionnaire(uuid, text[], text[], text[]) to anon, authenticated;

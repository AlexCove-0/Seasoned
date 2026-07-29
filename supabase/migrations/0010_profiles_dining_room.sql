-- The Dining Room model: each account-holder owns ONE canonical taste
-- profile, and "inviting" someone creates a mutual share of profiles
-- between the two people -- NOT membership in each other's kitchens.
-- Your Dining Room = profiles shared with you + placeholder members you
-- created yourself in your own kitchen. Because shared profiles are read
-- by reference (never copied), when my sister updates her tastes it
-- updates for everyone she's shared with automatically.

create table profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  taste_preferences text[] not null default '{}',
  disliked_tastes text[] not null default '{}',
  allergies text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table profile_shares (
  id uuid primary key default gen_random_uuid(),
  profile_user_id uuid not null references auth.users (id) on delete cascade,
  shared_with_user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_user_id, shared_with_user_id)
);

alter table profiles enable row level security;
alter table profile_shares enable row level security;

create policy "profiles: owner can select"
  on profiles for select using (user_id = auth.uid());
create policy "profiles: shared-with can select"
  on profiles for select using (
    exists (
      select 1 from profile_shares ps
      where ps.profile_user_id = profiles.user_id and ps.shared_with_user_id = auth.uid()
    )
  );
create policy "profiles: owner can insert"
  on profiles for insert to authenticated with check (user_id = auth.uid());
create policy "profiles: owner can update"
  on profiles for update using (user_id = auth.uid());

grant select, insert, update on profiles to authenticated;

create policy "profile_shares: involved parties can select"
  on profile_shares for select
  using (profile_user_id = auth.uid() or shared_with_user_id = auth.uid());
create policy "profile_shares: either side can sever"
  on profile_shares for delete
  using (profile_user_id = auth.uid() or shared_with_user_id = auth.uid());

grant select, delete on profile_shares to authenticated;

-- Accepting an invite: mutually share profiles with every account-holder
-- in the inviting household. Security definer because the accepter can't
-- see that household's member list under RLS.
create or replace function connect_via_invite_code(p_invite_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
begin
  select id into v_household_id from households where invite_code = upper(p_invite_code);
  if v_household_id is null then
    raise exception 'Invalid invite code';
  end if;

  insert into profile_shares (profile_user_id, shared_with_user_id)
  select auth.uid(), hm.user_id
  from household_members hm
  where hm.household_id = v_household_id and hm.user_id is not null and hm.user_id <> auth.uid()
  on conflict do nothing;

  insert into profile_shares (profile_user_id, shared_with_user_id)
  select hm.user_id, auth.uid()
  from household_members hm
  where hm.household_id = v_household_id and hm.user_id is not null and hm.user_id <> auth.uid()
  on conflict do nothing;
end;
$$;

grant execute on function connect_via_invite_code(text) to authenticated;

-- Per-household view of a shared profile (favorite flag lives with the
-- viewer, not the profile owner -- only I choose my favorites). Rows are
-- created lazily the first time a household favorites/groups someone.
create table dining_room_entries (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  profile_user_id uuid not null references auth.users (id) on delete cascade,
  is_favorite boolean not null default false,
  unique (household_id, profile_user_id)
);

alter table dining_room_entries enable row level security;
create policy "dining_room_entries: household members full access"
  on dining_room_entries for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));
grant select, insert, update, delete on dining_room_entries to authenticated;

-- Named groups ("Family") so a whole table's worth of diners can be
-- picked in one tap when starting a recipe.
create table dining_groups (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name text not null
);

alter table dining_groups enable row level security;
create policy "dining_groups: household members full access"
  on dining_groups for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));
grant select, insert, update, delete on dining_groups to authenticated;

-- A group member is either a placeholder in my own kitchen (member_id)
-- or a connected friend's shared profile (profile_user_id), never both.
create table dining_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references dining_groups (id) on delete cascade,
  member_id uuid references household_members (id) on delete cascade,
  profile_user_id uuid references auth.users (id) on delete cascade,
  check ((member_id is null) <> (profile_user_id is null))
);

alter table dining_group_members enable row level security;
create policy "dining_group_members: household members full access"
  on dining_group_members for all
  using (exists (select 1 from dining_groups g where g.id = group_id and is_household_member(g.household_id)))
  with check (exists (select 1 from dining_groups g where g.id = group_id and is_household_member(g.household_id)));
grant select, insert, update, delete on dining_group_members to authenticated;

-- Backfill: existing account-holders get their canonical profile seeded
-- from their claimed household_members row.
insert into profiles (user_id, display_name, taste_preferences, disliked_tastes, allergies)
select hm.user_id, hm.display_name, hm.taste_preferences, hm.disliked_tastes, hm.allergies
from household_members hm
where hm.user_id is not null
on conflict (user_id) do nothing;

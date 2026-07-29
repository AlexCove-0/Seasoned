-- Every quiz result is kept, not overwritten -- tastes genuinely shift over
-- the years, and the interesting thing isn't just today's profile but the
-- direction it's moving (someone climbing the heat axis, or drifting away
-- from richness). The live profile row still holds the current answer; this
-- is the trail behind it.
create table flavor_profile_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  member_id uuid references household_members (id) on delete cascade,
  flavor_axes jsonb not null,
  texture_flags text[] not null default '{}',
  flavor_archetype text,
  quiz_version int not null default 2,
  taken_at timestamptz not null default now(),
  constraint flavor_history_one_subject check ((user_id is null) <> (member_id is null))
);

alter table flavor_profile_history enable row level security;

create policy "flavor_history: own results"
  on flavor_profile_history for select
  using (user_id = auth.uid());

create policy "flavor_history: results for my household's members"
  on flavor_profile_history for select
  using (
    member_id is not null
    and exists (
      select 1 from household_members hm
      where hm.id = flavor_profile_history.member_id and is_household_member(hm.household_id)
    )
  );

create policy "flavor_history: insert own"
  on flavor_profile_history for insert
  to authenticated
  with check (
    user_id = auth.uid()
    or (
      member_id is not null
      and exists (
        select 1 from household_members hm
        where hm.id = member_id and is_household_member(hm.household_id)
      )
    )
  );

grant select, insert on flavor_profile_history to authenticated;

-- Adds per-person taste profiles/allergies and household-wide kitchen preferences.

-- A household member no longer has to be a login (e.g. a kid without their own
-- account can still get a profile that recipes are tailored around).
alter table household_members
  alter column user_id drop not null,
  add column taste_preferences text[] not null default '{}',
  add column regional_tastes text[] not null default '{}',
  add column allergies text[] not null default '{}';

-- Kitchen-wide style lean (e.g. "lean Mediterranean"), independent of any one person.
alter table households
  add column kitchen_regional_tastes text[] not null default '{}';

-- Let an existing member add a person who doesn't log in themself.
create policy "household_members: members can add people without login"
  on household_members for insert
  to authenticated
  with check (is_household_member(household_id) and user_id is null);

-- Editing taste/regional/allergy info (for yourself or anyone in the household)
-- needs an update policy; there wasn't one before.
create policy "household_members: members can update roster"
  on household_members for update
  using (is_household_member(household_id));

-- Same gap on households -- needed so kitchen-wide preferences can be edited.
create policy "households: members can update"
  on households for update
  using (is_household_member(id));

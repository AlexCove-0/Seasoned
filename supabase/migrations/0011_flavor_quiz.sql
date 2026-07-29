-- Flavor quiz results. Stored on both tables because a taste profile can
-- belong to an account-holder (profiles, the canonical shared row) or to a
-- placeholder person someone created in their own kitchen
-- (household_members) -- and you can take the quiz on a placeholder's behalf.
--
-- flavor_axes is a jsonb map of axis id -> 0-100, e.g.
--   {"bitter":22,"heat":64,"richness":78,"acid":71,"funk":55,
--    "sweet_savory":34,"adventure":82}
-- Kept as jsonb rather than seven columns so adding an eighth axis later
-- doesn't need a migration on two tables.

alter table profiles
  add column flavor_axes jsonb,
  add column texture_flags text[] not null default '{}',
  add column flavor_archetype text,
  add column quiz_taken_at timestamptz;

alter table household_members
  add column flavor_axes jsonb,
  add column texture_flags text[] not null default '{}',
  add column flavor_archetype text,
  add column quiz_taken_at timestamptz;

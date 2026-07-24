-- Supports the "My Kitchen" hub: favorited profiles (who shows up by default
-- when picking who you're cooking for) and manually-curated pantry staples,
-- separate from the auto-tracked "ingredients you've actually used" list.

alter table household_members
  add column is_favorite boolean not null default true;

alter table households
  add column pantry_staples text[] not null default '{}';

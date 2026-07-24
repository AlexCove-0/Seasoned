-- Supports the per-recipe setup step (servings, regional twist, ingredients on
-- hand) and persistent kitchen appliances. Regional style is no longer
-- auto-applied from a person's profile or the household default on every
-- recipe -- it's now an explicit choice made each time, so the AI doesn't
-- default to a diner's heritage cuisine when nobody asked for it tonight.

alter table households
  add column appliances text[] not null default '{}';

create table household_ingredients (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name text not null,
  use_count int not null default 1,
  last_used_at timestamptz not null default now(),
  unique (household_id, name)
);

alter table household_ingredients enable row level security;

create policy "household_ingredients: members can select"
  on household_ingredients for select
  using (is_household_member(household_id));

create policy "household_ingredients: members can insert"
  on household_ingredients for insert
  to authenticated
  with check (is_household_member(household_id));

create policy "household_ingredients: members can update"
  on household_ingredients for update
  using (is_household_member(household_id));

-- Single round-trip upsert-and-increment for a whole ingredients list.
create or replace function bump_ingredients_usage(p_household_id uuid, p_names text[])
returns void
language sql
security invoker
as $$
  insert into household_ingredients (household_id, name, use_count, last_used_at)
  select p_household_id, name, 1, now() from unnest(p_names) as name
  on conflict (household_id, name)
  do update set
    use_count = household_ingredients.use_count + 1,
    last_used_at = now();
$$;

grant execute on function bump_ingredients_usage(uuid, text[]) to authenticated;

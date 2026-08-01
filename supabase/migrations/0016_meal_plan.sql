-- The weekly plan. One row per meal slot on a date.
--
-- recipe_id is nullable on purpose: half the week's slots in a real house
-- are "leftovers", "takeout", or "at my mom's", and a planner that only
-- accepts saved recipes stops reflecting reality within a week.

create table meal_plan_entries (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  planned_for date not null,
  recipe_id uuid references recipes (id) on delete cascade,
  note text,
  -- Who's expected at the table, carried into the cook so the chef doesn't
  -- have to ask again. household_members ids; not a FK array by design.
  diner_ids uuid[] not null default '{}',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  constraint meal_plan_entries_has_content check (recipe_id is not null or nullif(btrim(coalesce(note, '')), '') is not null)
);

create index meal_plan_entries_household_date on meal_plan_entries (household_id, planned_for);

alter table meal_plan_entries enable row level security;

create policy "meal_plan_entries: members can select"
  on meal_plan_entries for select
  using (is_household_member(household_id));

create policy "meal_plan_entries: members can insert"
  on meal_plan_entries for insert
  to authenticated
  with check (is_household_member(household_id) and created_by = auth.uid());

create policy "meal_plan_entries: members can update"
  on meal_plan_entries for update
  using (is_household_member(household_id));

create policy "meal_plan_entries: members can delete"
  on meal_plan_entries for delete
  using (is_household_member(household_id));

grant select, insert, update, delete on meal_plan_entries to authenticated;

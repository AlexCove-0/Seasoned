create table shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name text not null,
  checked boolean not null default false,
  added_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

alter table shopping_list_items enable row level security;

create policy "shopping_list_items: members can select"
  on shopping_list_items for select
  using (is_household_member(household_id));

create policy "shopping_list_items: members can insert"
  on shopping_list_items for insert
  to authenticated
  with check (is_household_member(household_id) and added_by = auth.uid());

create policy "shopping_list_items: members can update"
  on shopping_list_items for update
  using (is_household_member(household_id));

create policy "shopping_list_items: members can delete"
  on shopping_list_items for delete
  using (is_household_member(household_id));

-- New tables need their own grant -- RLS policies alone aren't enough,
-- Postgres checks base table privileges first (see migration 0003).
grant select, insert, update, delete on shopping_list_items to authenticated;

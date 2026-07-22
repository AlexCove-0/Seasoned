-- Sous Phase 1 schema: households, membership, recipes, chat history, cook logs.
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- households
-- ---------------------------------------------------------------------------
create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- household_members
-- ---------------------------------------------------------------------------
create table household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  unique (household_id, user_id)
);

-- SECURITY DEFINER helper so RLS policies can check membership without the
-- policy on household_members recursively querying itself.
create function is_household_member(target_household_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from household_members
    where household_id = target_household_id
      and user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- recipes
-- ---------------------------------------------------------------------------
create table recipes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  title text not null,
  -- [{ "name": "ribeye steak", "quantity": 2, "unit": "each" }, ...]
  ingredients jsonb not null default '[]'::jsonb,
  -- [{ "instruction": "...", "technique_note": "..." }, ...]
  steps jsonb not null default '[]'::jsonb,
  base_servings int not null default 4,
  tags text[] not null default '{}',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ai_conversations
-- ---------------------------------------------------------------------------
create table ai_conversations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  user_id uuid not null references auth.users (id),
  -- [{ "role": "user" | "assistant", "content": "..." }, ...]
  messages jsonb not null default '[]'::jsonb,
  resulting_recipe_id uuid references recipes (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- cook_logs
-- ---------------------------------------------------------------------------
create table cook_logs (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes (id) on delete cascade,
  cooked_at timestamptz not null default now(),
  servings_made int,
  adjustments text,
  rating int check (rating between 1 and 5),
  notes text,
  created_by uuid not null references auth.users (id)
);

-- Lets a user who isn't a member yet resolve an invite code to a household id
-- (the join flow), without exposing the rest of the households table to
-- non-members via a broad RLS policy.
create function household_id_for_invite_code(code text)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from households where invite_code = code;
$$;

grant execute on function household_id_for_invite_code(text) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table households enable row level security;
alter table household_members enable row level security;
alter table recipes enable row level security;
alter table ai_conversations enable row level security;
alter table cook_logs enable row level security;

-- households: any signed-in user can create one (household creation flow);
-- only members can see/update it afterward.
create policy "households: members can select"
  on households for select
  using (is_household_member(id));

create policy "households: any authenticated user can create"
  on households for insert
  to authenticated
  with check (true);

-- household_members: members can see their household's roster; a user can
-- add themself (join flow) but not add others.
create policy "household_members: members can select roster"
  on household_members for select
  using (is_household_member(household_id));

create policy "household_members: user can join themself"
  on household_members for insert
  to authenticated
  with check (user_id = auth.uid());

-- recipes
create policy "recipes: members can select"
  on recipes for select
  using (is_household_member(household_id));

create policy "recipes: members can insert"
  on recipes for insert
  to authenticated
  with check (is_household_member(household_id) and created_by = auth.uid());

create policy "recipes: members can update"
  on recipes for update
  using (is_household_member(household_id));

create policy "recipes: members can delete"
  on recipes for delete
  using (is_household_member(household_id));

-- ai_conversations
create policy "ai_conversations: members can select"
  on ai_conversations for select
  using (is_household_member(household_id));

create policy "ai_conversations: members can insert"
  on ai_conversations for insert
  to authenticated
  with check (is_household_member(household_id) and user_id = auth.uid());

create policy "ai_conversations: members can update"
  on ai_conversations for update
  using (is_household_member(household_id));

-- cook_logs: scoped via the parent recipe's household
create policy "cook_logs: members can select"
  on cook_logs for select
  using (
    exists (
      select 1 from recipes
      where recipes.id = cook_logs.recipe_id
        and is_household_member(recipes.household_id)
    )
  );

create policy "cook_logs: members can insert"
  on cook_logs for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from recipes
      where recipes.id = cook_logs.recipe_id
        and is_household_member(recipes.household_id)
    )
  );

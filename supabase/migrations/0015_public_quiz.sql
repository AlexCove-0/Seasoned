-- Standalone taste quiz: anyone can take it with no account, get a result,
-- and hand it to whoever actually cooks for them.
--
-- Same trust model as recipe_shares (0007) and the invite questionnaire
-- (0009): an unguessable token is the entire auth for a narrow public
-- surface, exposed only through security-definer RPCs rather than by
-- opening RLS to the anon role.

create table public_quiz_results (
  id uuid primary key default gen_random_uuid(),
  share_token text not null unique,
  display_name text,
  flavor_axes jsonb not null,
  texture_flags text[] not null default '{}',
  flavor_archetype text not null,
  quiz_version int not null default 1,
  created_at timestamptz not null default now()
);

alter table public_quiz_results enable row level security;
-- No policies on purpose: every path goes through the RPCs below.

create or replace function save_public_quiz_result(
  p_display_name text,
  p_flavor_axes jsonb,
  p_texture_flags text[],
  p_flavor_archetype text,
  p_quiz_version int default 1
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text;
begin
  v_token := replace(gen_random_uuid()::text, '-', '');

  insert into public_quiz_results (
    share_token, display_name, flavor_axes, texture_flags, flavor_archetype, quiz_version
  )
  values (
    v_token,
    nullif(btrim(coalesce(p_display_name, '')), ''),
    p_flavor_axes,
    coalesce(p_texture_flags, '{}'),
    p_flavor_archetype,
    coalesce(p_quiz_version, 1)
  );

  return v_token;
end;
$$;

grant execute on function save_public_quiz_result(text, jsonb, text[], text, int) to anon, authenticated;

create or replace function get_public_quiz_result(p_token text)
returns table (
  display_name text,
  flavor_axes jsonb,
  texture_flags text[],
  flavor_archetype text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select display_name, flavor_axes, texture_flags, flavor_archetype, created_at
  from public_quiz_results
  where share_token = p_token;
$$;

grant execute on function get_public_quiz_result(text) to anon, authenticated;

-- Lets someone rename their result after the fact ("oh, I should put my
-- name on this before sending it"). Token-scoped, name only.
create or replace function name_public_quiz_result(p_token text, p_display_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public_quiz_results
  set display_name = nullif(btrim(coalesce(p_display_name, '')), '')
  where share_token = p_token;
end;
$$;

grant execute on function name_public_quiz_result(text, text) to anon, authenticated;

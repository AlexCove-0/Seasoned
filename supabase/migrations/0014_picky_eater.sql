-- Picky-eater profile fields.
--
-- Deliberately separate from texture_flags (0011), which the flavor quiz
-- derives and overwrites on every retake. These four are parent-entered and
-- must survive a quiz retake, so they get their own columns.
--
-- is_picky_eater is signal on its own: even with every other field empty, it
-- tells the chef to keep that diner's portion simple and separable.

alter table profiles
  add column is_picky_eater boolean not null default false,
  add column safe_foods text[] not null default '{}',
  add column avoid_textures text[] not null default '{}',
  add column structure_rules text[] not null default '{}';

alter table household_members
  add column is_picky_eater boolean not null default false,
  add column safe_foods text[] not null default '{}',
  add column avoid_textures text[] not null default '{}',
  add column structure_rules text[] not null default '{}';

-- Widen the public invite questionnaire to collect the same fields, so a
-- parent filling one out for a kid (or an adult for themself) captures this
-- without needing an account. Same trust model as before: token-only auth,
-- unclaimed profiles only.
drop function if exists submit_taste_questionnaire(uuid, text[], text[], text[]);

create or replace function submit_taste_questionnaire(
  p_token uuid,
  p_taste_preferences text[],
  p_disliked_tastes text[],
  p_allergies text[],
  p_is_picky_eater boolean default false,
  p_safe_foods text[] default '{}',
  p_avoid_textures text[] default '{}',
  p_structure_rules text[] default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update household_members
  set taste_preferences = p_taste_preferences,
      disliked_tastes = p_disliked_tastes,
      allergies = p_allergies,
      is_picky_eater = p_is_picky_eater,
      safe_foods = p_safe_foods,
      avoid_textures = p_avoid_textures,
      structure_rules = p_structure_rules
  where invite_token = p_token
    and user_id is null;

  if not found then
    raise exception 'This invite link is no longer valid';
  end if;
end;
$$;

grant execute on function submit_taste_questionnaire(
  uuid, text[], text[], text[], boolean, text[], text[], text[]
) to anon, authenticated;

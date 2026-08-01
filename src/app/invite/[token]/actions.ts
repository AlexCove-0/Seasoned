"use server";

import { createClient } from "@/lib/supabase/server";

export type PickyEaterPayload = {
  isPickyEater: boolean;
  safeFoods: string[];
  avoidTextures: string[];
  structureRules: string[];
};

export async function submitTasteQuestionnaire(
  token: string,
  tastePreferences: string[],
  dislikedTastes: string[],
  allergies: string[],
  picky: PickyEaterPayload,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_taste_questionnaire", {
    p_token: token,
    p_taste_preferences: tastePreferences,
    p_disliked_tastes: dislikedTastes,
    p_allergies: allergies,
    p_is_picky_eater: picky.isPickyEater,
    // Follow-ups are meaningless without the toggle, so don't persist them.
    p_safe_foods: picky.isPickyEater ? picky.safeFoods : [],
    p_avoid_textures: picky.isPickyEater ? picky.avoidTextures : [],
    p_structure_rules: picky.isPickyEater ? picky.structureRules : [],
  });

  if (error) return { error: error.message };
  return { error: null };
}

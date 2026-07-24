"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitTasteQuestionnaire(
  token: string,
  tastePreferences: string[],
  dislikedTastes: string[],
  allergies: string[],
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_taste_questionnaire", {
    p_token: token,
    p_taste_preferences: tastePreferences,
    p_disliked_tastes: dislikedTastes,
    p_allergies: allergies,
  });

  if (error) return { error: error.message };
  return { error: null };
}

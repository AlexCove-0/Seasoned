"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";
import { QUIZ_VERSION } from "@/lib/flavor/quiz";
import type { FlavorAxes } from "@/lib/flavor/axes";

/**
 * Saves a result taken with no account and returns its share token. Goes
 * through a security-definer RPC rather than a direct insert, so the anon
 * role never gets table access.
 */
export async function savePublicQuizResult(
  displayName: string,
  axes: FlavorAxes,
  textureFlags: string[],
  archetype: string,
): Promise<{ token: string | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("save_public_quiz_result", {
    p_display_name: displayName,
    p_flavor_axes: axes,
    p_texture_flags: textureFlags,
    p_flavor_archetype: archetype,
    p_quiz_version: QUIZ_VERSION,
  });

  if (error) return { token: null, error: error.message };
  return { token: data as string, error: null };
}

export async function namePublicQuizResult(token: string, displayName: string) {
  const supabase = await createClient();
  await supabase.rpc("name_public_quiz_result", {
    p_token: token,
    p_display_name: displayName,
  });
  revalidatePath(`/taste/${token}`);
}

/**
 * The growth loop's payoff: a cook opens someone's shared result and adds
 * them straight into their dining room, flavor axes and all.
 */
export async function addSharedResultToKitchen(
  token: string,
  displayName: string,
): Promise<{ error: string | null }> {
  const name = displayName.trim();
  if (!name) return { error: "Give them a name first." };

  const household = await getCurrentHousehold();
  if (!household) return { error: "You need a kitchen before you can add someone to it." };

  const supabase = await createClient();
  const { data, error: fetchError } = await supabase.rpc("get_public_quiz_result", {
    p_token: token,
  });
  if (fetchError) return { error: fetchError.message };

  const row = (
    data as
      | { flavor_axes: FlavorAxes; texture_flags: string[]; flavor_archetype: string }[]
      | null
  )?.[0];
  if (!row) return { error: "That quiz result link is no longer valid." };

  const { error } = await supabase.from("household_members").insert({
    household_id: household.id,
    user_id: null,
    display_name: name,
    flavor_axes: row.flavor_axes,
    texture_flags: row.texture_flags,
    flavor_archetype: row.flavor_archetype,
    quiz_taken_at: new Date().toISOString(),
    is_favorite: true,
  });

  if (error) return { error: error.message };

  revalidatePath("/kitchen");
  return { error: null };
}

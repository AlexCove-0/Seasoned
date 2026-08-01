"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { QUIZ_VERSION } from "@/lib/flavor/quiz";
import { archetypeFor } from "@/lib/flavor/scoring";
import type { FlavorAxes } from "@/lib/flavor/axes";

type SaveResult = { error: string | null };

/**
 * `memberId` targets a placeholder person in your own kitchen (someone with
 * no login, whose quiz you're filling out for them). Omitted, it saves to
 * the signed-in user's own canonical profile.
 *
 * Scoring happens on the client so the result screen can render instantly;
 * this just persists it and appends to the history trail.
 */
export async function saveQuizResult(
  axes: FlavorAxes,
  textureFlags: string[],
  archetype: string,
  memberId?: string,
): Promise<SaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const payload = {
    flavor_axes: axes,
    texture_flags: textureFlags,
    flavor_archetype: archetype,
    quiz_taken_at: new Date().toISOString(),
  };

  if (memberId) {
    const { error } = await supabase
      .from("household_members")
      .update(payload)
      .eq("id", memberId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("profiles")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    if (error) return { error: error.message };

    // Keep this user's own kitchen card in step with their canonical profile.
    await supabase.from("household_members").update(payload).eq("user_id", user.id);
  }

  // Append rather than overwrite -- palates drift, and the trail is the
  // only way to see which direction someone is moving.
  await supabase.from("flavor_profile_history").insert({
    user_id: memberId ? null : user.id,
    member_id: memberId ?? null,
    flavor_axes: axes,
    texture_flags: textureFlags,
    flavor_archetype: archetype,
    quiz_version: QUIZ_VERSION,
  });

  revalidatePath("/kitchen");
  return { error: null };
}

/**
 * A hand-adjustment, not a quiz result. Recorded in the history trail the
 * same way so a profile's changes stay readable end to end, but tagged
 * version 0 to keep manual edits distinguishable from scored runs.
 */
export async function saveAxisAdjustment(
  axes: FlavorAxes,
  memberId?: string,
): Promise<SaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const clean = Object.fromEntries(
    Object.entries(axes).map(([k, v]) => [k, Math.min(100, Math.max(0, Math.round(Number(v) || 0)))]),
  ) as FlavorAxes;

  // The archetype is derived, so it has to be recomputed rather than kept
  // from whatever the quiz last produced.
  const archetype = archetypeFor(clean);
  const payload = { flavor_axes: clean, flavor_archetype: archetype };

  if (memberId) {
    const { error } = await supabase.from("household_members").update(payload).eq("id", memberId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("profiles")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    if (error) return { error: error.message };
    await supabase.from("household_members").update(payload).eq("user_id", user.id);
  }

  await supabase.from("flavor_profile_history").insert({
    user_id: memberId ? null : user.id,
    member_id: memberId ?? null,
    flavor_axes: clean,
    texture_flags: [],
    flavor_archetype: archetype,
    quiz_version: 0,
  });

  revalidatePath("/kitchen");
  return { error: null };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";

type State = { error: string | null };

/**
 * Picky-eater fields only mean something while the toggle is on, so turning
 * it off clears the follow-ups rather than leaving stale constraints that
 * would keep steering recipes invisibly.
 */
function readPickyEaterFields(formData: FormData) {
  const isPickyEater = formData.get("isPickyEater") === "on";
  return {
    is_picky_eater: isPickyEater,
    safe_foods: isPickyEater ? formData.getAll("safeFoods").map(String) : [],
    avoid_textures: isPickyEater ? formData.getAll("avoidTextures").map(String) : [],
    structure_rules: isPickyEater ? formData.getAll("structureRules").map(String) : [],
  };
}

export async function addPerson(_prevState: State, formData: FormData): Promise<State> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) return { error: "Enter a name." };

  const household = await getCurrentHousehold();
  if (!household) return { error: "No household found." };

  const tastePreferences = formData.getAll("tastePreferences").map(String);
  const dislikedTastes = formData.getAll("dislikedTastes").map(String);
  const allergies = formData.getAll("allergies").map(String);
  const isFavorite = formData.get("isFavorite") === "on";
  const picky = readPickyEaterFields(formData);

  const supabase = await createClient();
  const { error } = await supabase.from("household_members").insert({
    household_id: household.id,
    user_id: null,
    display_name: displayName,
    taste_preferences: tastePreferences,
    disliked_tastes: dislikedTastes,
    allergies,
    is_favorite: isFavorite,
    ...picky,
  });

  if (error) return { error: error.message };

  revalidatePath("/kitchen");
  return { error: null };
}

export async function updatePerson(_prevState: State, formData: FormData): Promise<State> {
  const memberId = String(formData.get("memberId") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!memberId || !displayName) return { error: "Enter a name." };

  const tastePreferences = formData.getAll("tastePreferences").map(String);
  const dislikedTastes = formData.getAll("dislikedTastes").map(String);
  const allergies = formData.getAll("allergies").map(String);
  const isFavorite = formData.get("isFavorite") === "on";
  const picky = readPickyEaterFields(formData);

  const supabase = await createClient();
  const { error } = await supabase
    .from("household_members")
    .update({
      display_name: displayName,
      taste_preferences: tastePreferences,
      disliked_tastes: dislikedTastes,
      allergies,
      is_favorite: isFavorite,
      ...picky,
    })
    .eq("id", memberId);

  if (error) return { error: error.message };

  // If this member row is the signed-in user's own, write through to the
  // canonical shared profile so connected households see the update too.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: memberRow } = await supabase
    .from("household_members")
    .select("user_id")
    .eq("id", memberId)
    .maybeSingle<{ user_id: string | null }>();
  if (user && memberRow?.user_id === user.id) {
    await supabase.from("profiles").upsert({
      user_id: user.id,
      display_name: displayName,
      taste_preferences: tastePreferences,
      disliked_tastes: dislikedTastes,
      allergies,
      ...picky,
      updated_at: new Date().toISOString(),
    });
  }

  revalidatePath("/kitchen");
  return { error: null };
}

export async function toggleFavorite(memberId: string, isFavorite: boolean) {
  const supabase = await createClient();
  await supabase.from("household_members").update({ is_favorite: isFavorite }).eq("id", memberId);
  revalidatePath("/kitchen");
}

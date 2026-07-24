"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";

type State = { error: string | null };

export async function addPerson(_prevState: State, formData: FormData): Promise<State> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) return { error: "Enter a name." };

  const household = await getCurrentHousehold();
  if (!household) return { error: "No household found." };

  const tastePreferences = formData.getAll("tastePreferences").map(String);
  const dislikedTastes = formData.getAll("dislikedTastes").map(String);
  const allergies = formData.getAll("allergies").map(String);
  const isFavorite = formData.get("isFavorite") === "on";

  const supabase = await createClient();
  const { error } = await supabase.from("household_members").insert({
    household_id: household.id,
    user_id: null,
    display_name: displayName,
    taste_preferences: tastePreferences,
    disliked_tastes: dislikedTastes,
    allergies,
    is_favorite: isFavorite,
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

  const supabase = await createClient();
  const { error } = await supabase
    .from("household_members")
    .update({
      display_name: displayName,
      taste_preferences: tastePreferences,
      disliked_tastes: dislikedTastes,
      allergies,
      is_favorite: isFavorite,
    })
    .eq("id", memberId);

  if (error) return { error: error.message };

  revalidatePath("/kitchen");
  return { error: null };
}

export async function toggleFavorite(memberId: string, isFavorite: boolean) {
  const supabase = await createClient();
  await supabase.from("household_members").update({ is_favorite: isFavorite }).eq("id", memberId);
  revalidatePath("/kitchen");
}

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
  const regionalTastes = formData.getAll("regionalTastes").map(String);
  const allergies = formData.getAll("allergies").map(String);

  const supabase = await createClient();
  const { error } = await supabase.from("household_members").insert({
    household_id: household.id,
    user_id: null,
    display_name: displayName,
    taste_preferences: tastePreferences,
    regional_tastes: regionalTastes,
    allergies,
  });

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { error: null };
}

export async function updatePerson(_prevState: State, formData: FormData): Promise<State> {
  const memberId = String(formData.get("memberId") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!memberId || !displayName) return { error: "Enter a name." };

  const tastePreferences = formData.getAll("tastePreferences").map(String);
  const regionalTastes = formData.getAll("regionalTastes").map(String);
  const allergies = formData.getAll("allergies").map(String);

  const supabase = await createClient();
  const { error } = await supabase
    .from("household_members")
    .update({
      display_name: displayName,
      taste_preferences: tastePreferences,
      regional_tastes: regionalTastes,
      allergies,
    })
    .eq("id", memberId);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { error: null };
}

export async function updateAppliances(_prevState: State, formData: FormData): Promise<State> {
  const household = await getCurrentHousehold();
  if (!household) return { error: "No household found." };

  const appliances = formData.getAll("appliances").map(String);

  const supabase = await createClient();
  const { error } = await supabase
    .from("households")
    .update({ appliances })
    .eq("id", household.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { error: null };
}

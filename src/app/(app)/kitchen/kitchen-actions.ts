"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";

type State = { error: string | null };

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

  revalidatePath("/kitchen");
  return { error: null };
}

export async function updatePantryStaples(_prevState: State, formData: FormData): Promise<State> {
  const household = await getCurrentHousehold();
  if (!household) return { error: "No household found." };

  const pantryStaples = formData.getAll("pantryStaples").map(String);

  const supabase = await createClient();
  const { error } = await supabase
    .from("households")
    .update({ pantry_staples: pantryStaples })
    .eq("id", household.id);

  if (error) return { error: error.message };

  revalidatePath("/kitchen");
  return { error: null };
}

export async function updateHouseholdName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const household = await getCurrentHousehold();
  if (!household) return;

  const supabase = await createClient();
  await supabase.from("households").update({ name: trimmed }).eq("id", household.id);

  revalidatePath("/kitchen");
  revalidatePath("/");
}

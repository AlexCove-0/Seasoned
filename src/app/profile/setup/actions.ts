"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type State = { error: string | null };

export async function saveProfile(_prevState: State, formData: FormData): Promise<State> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) return { error: "Enter your name." };

  const tastePreferences = formData.getAll("tastePreferences").map(String);
  const regionalTastes = formData.getAll("regionalTastes").map(String);
  const allergies = formData.getAll("allergies").map(String);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const { error } = await supabase
    .from("household_members")
    .update({
      display_name: displayName,
      taste_preferences: tastePreferences,
      regional_tastes: regionalTastes,
      allergies,
    })
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  redirect("/");
}

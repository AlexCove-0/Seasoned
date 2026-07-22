"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/household";

type State = { error: string | null };

export async function createHousehold(
  _prevState: State,
  formData: FormData,
): Promise<State> {
  const householdName = String(formData.get("householdName") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!householdName || !displayName) {
    return { error: "Fill in both fields." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  // Invite codes are unique; retry on the rare collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const inviteCode = generateInviteCode();
    const { data: household, error: householdError } = await supabase
      .from("households")
      .insert({ name: householdName, invite_code: inviteCode })
      .select("id")
      .single();

    if (householdError) {
      if (householdError.code === "23505") continue; // invite_code collision, retry
      return { error: householdError.message };
    }

    const { error: memberError } = await supabase
      .from("household_members")
      .insert({
        household_id: household.id,
        user_id: user.id,
        display_name: displayName,
      });

    if (memberError) return { error: memberError.message };

    redirect("/");
  }

  return { error: "Couldn't generate a unique invite code, try again." };
}

export async function joinHousehold(
  _prevState: State,
  formData: FormData,
): Promise<State> {
  const inviteCode = String(formData.get("inviteCode") ?? "")
    .trim()
    .toUpperCase();
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!inviteCode || !displayName) {
    return { error: "Fill in both fields." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const { data: householdId, error: lookupError } = await supabase.rpc(
    "household_id_for_invite_code",
    { code: inviteCode },
  );

  if (lookupError) return { error: lookupError.message };
  if (!householdId) return { error: "No household found with that invite code." };

  const { error: memberError } = await supabase.from("household_members").insert({
    household_id: householdId,
    user_id: user.id,
    display_name: displayName,
  });

  if (memberError) return { error: memberError.message };

  redirect("/");
}

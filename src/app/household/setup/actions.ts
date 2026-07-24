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

  // Invite codes are unique; retry on the rare collision. The id is generated
  // client-side (rather than relying on INSERT...RETURNING) because right
  // after creating the household the current user isn't a member yet, so the
  // households SELECT policy would hide the row from RETURNING and PostgREST
  // reports that as an RLS violation.
  for (let attempt = 0; attempt < 5; attempt++) {
    const householdId = crypto.randomUUID();
    const inviteCode = generateInviteCode();
    const { error: householdError } = await supabase
      .from("households")
      .insert({ id: householdId, name: householdName, invite_code: inviteCode });

    if (householdError) {
      if (householdError.code === "23505") continue; // invite_code collision, retry
      return { error: householdError.message };
    }

    const { error: memberError } = await supabase
      .from("household_members")
      .insert({
        household_id: householdId,
        user_id: user.id,
        display_name: displayName,
      });

    if (memberError) return { error: memberError.message };

    redirect("/profile/setup");
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

  redirect("/profile/setup");
}

export type UnclaimedProfile = { id: string; display_name: string };

export async function lookupUnclaimedProfiles(
  inviteCode: string,
): Promise<{ profiles: UnclaimedProfile[]; error: string | null }> {
  const code = inviteCode.trim().toUpperCase();
  if (!code) return { profiles: [], error: null };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("unclaimed_profiles_for_invite_code", {
    p_invite_code: code,
  });

  if (error) return { profiles: [], error: error.message };
  return { profiles: (data as UnclaimedProfile[]) ?? [], error: null };
}

export async function claimProfile(inviteCode: string, memberId: string): Promise<State> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const { error } = await supabase.rpc("claim_household_profile", {
    p_invite_code: inviteCode.trim().toUpperCase(),
    p_member_id: memberId,
  });

  if (error) return { error: error.message };

  redirect("/profile/setup");
}

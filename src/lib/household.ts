import { createClient } from "@/lib/supabase/server";

export type CurrentHousehold = {
  id: string;
  name: string;
  invite_code: string;
  display_name: string;
};

/** Returns the signed-in user's household, or null if they haven't joined one yet. */
export async function getCurrentHousehold(): Promise<CurrentHousehold | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("household_members")
    .select("display_name, households(id, name, invite_code)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || !membership.households) return null;

  const household = Array.isArray(membership.households)
    ? membership.households[0]
    : membership.households;

  return {
    id: household.id,
    name: household.name,
    invite_code: household.invite_code,
    display_name: membership.display_name,
  };
}

function generateInviteCode(): string {
  // Short, easy to read aloud/text to a family member.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export { generateInviteCode };

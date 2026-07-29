"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";

// Favoriting a connected (shared) profile is the viewer household's own
// state -- the entry row is created lazily on first toggle.
export async function toggleConnectedFavorite(profileUserId: string, isFavorite: boolean) {
  const household = await getCurrentHousehold();
  if (!household) return;

  const supabase = await createClient();
  await supabase.from("dining_room_entries").upsert(
    { household_id: household.id, profile_user_id: profileUserId, is_favorite: isFavorite },
    { onConflict: "household_id,profile_user_id" },
  );
  revalidatePath("/kitchen");
}

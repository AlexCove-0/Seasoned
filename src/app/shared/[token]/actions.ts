"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitGuestRating(
  token: string,
  name: string,
  rating: number,
  comment: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_guest_rating", {
    p_token: token,
    p_name: name,
    p_rating: rating,
    p_comment: comment || null,
  });

  if (error) return { error: error.message };
  return { error: null };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";

type State = { error: string | null };

export async function addToShoppingList(items: string[]) {
  if (items.length === 0) return;

  const household = await getCurrentHousehold();
  if (!household) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("shopping_list_items").insert(
    items.map((name) => ({
      household_id: household.id,
      name,
      added_by: user.id,
    })),
  );

  revalidatePath("/shopping-list");
}

export async function logCook(
  recipeId: string,
  _prevState: State,
  formData: FormData,
): Promise<State> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const servingsRaw = String(formData.get("servingsMade") ?? "").trim();
  const ratingRaw = String(formData.get("rating") ?? "").trim();
  const adjustments = String(formData.get("adjustments") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const imagePath = String(formData.get("imagePath") ?? "").trim();

  const { error } = await supabase.from("cook_logs").insert({
    recipe_id: recipeId,
    servings_made: servingsRaw ? Number(servingsRaw) : null,
    rating: ratingRaw ? Number(ratingRaw) : null,
    adjustments: adjustments || null,
    notes: notes || null,
    image_path: imagePath || null,
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath(`/recipes/${recipeId}`);
  return { error: null };
}

export async function setRecipePhoto(recipeId: string, path: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // RLS scopes the update to the caller's household; no extra check needed.
  await supabase.from("recipes").update({ image_path: path }).eq("id", recipeId);

  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath("/");
}

export async function submitRating(
  recipeId: string,
  memberId: string,
  rating: number,
  comment: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("recipe_ratings").upsert(
    {
      recipe_id: recipeId,
      member_id: memberId,
      rating,
      comment: comment.trim() || null,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "recipe_id,member_id" },
  );

  revalidatePath(`/recipes/${recipeId}`);
}

export async function createShareLink(recipeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const token = crypto.randomUUID().replace(/-/g, "");
  const { error } = await supabase
    .from("recipe_shares")
    .insert({ recipe_id: recipeId, share_token: token, created_by: user.id });

  if (error) return null;

  revalidatePath(`/recipes/${recipeId}`);
  return token;
}

export async function revokeShareLink(shareId: string, recipeId: string) {
  const supabase = await createClient();
  await supabase.from("recipe_shares").delete().eq("id", shareId);
  revalidatePath(`/recipes/${recipeId}`);
}

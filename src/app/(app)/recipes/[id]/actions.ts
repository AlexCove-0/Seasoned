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

  const { error } = await supabase.from("cook_logs").insert({
    recipe_id: recipeId,
    servings_made: servingsRaw ? Number(servingsRaw) : null,
    rating: ratingRaw ? Number(ratingRaw) : null,
    adjustments: adjustments || null,
    notes: notes || null,
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath(`/recipes/${recipeId}`);
  return { error: null };
}

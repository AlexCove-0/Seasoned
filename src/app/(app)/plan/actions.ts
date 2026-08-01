"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";
import { scaleIngredient } from "@/lib/scale-ingredients";
import type { Ingredient } from "@/lib/types";

type State = { error: string | null };

export async function planMeal(
  plannedFor: string,
  recipeId: string | null,
  note: string,
): Promise<State> {
  const household = await getCurrentHousehold();
  if (!household) return { error: "No household found." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const trimmedNote = note.trim();
  if (!recipeId && !trimmedNote) return { error: "Pick a recipe or jot something down." };

  const { error } = await supabase.from("meal_plan_entries").insert({
    household_id: household.id,
    planned_for: plannedFor,
    recipe_id: recipeId,
    note: trimmedNote || null,
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/plan");
  revalidatePath("/");
  return { error: null };
}

export async function unplanMeal(entryId: string) {
  const supabase = await createClient();
  await supabase.from("meal_plan_entries").delete().eq("id", entryId);
  revalidatePath("/plan");
  revalidatePath("/");
}

/**
 * Rolls every planned recipe in the range into the shopping list, minus
 * anything the kitchen always keeps stocked. Quantities are summed per
 * ingredient name so three recipes calling for onion produce one line.
 */
export async function addPlanToShoppingList(
  fromDate: string,
  toDate: string,
): Promise<{ added: number; error: string | null }> {
  const household = await getCurrentHousehold();
  if (!household) return { added: 0, error: "No household found." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { added: 0, error: "You're not signed in." };

  const { data: entries } = await supabase
    .from("meal_plan_entries")
    .select("recipes(ingredients, base_servings)")
    .eq("household_id", household.id)
    .gte("planned_for", fromDate)
    .lte("planned_for", toDate)
    .returns<{ recipes: { ingredients: Ingredient[]; base_servings: number } | null }[]>();

  const { data: householdRow } = await supabase
    .from("households")
    .select("pantry_staples")
    .eq("id", household.id)
    .single<{ pantry_staples: string[] }>();

  const staples = new Set((householdRow?.pantry_staples ?? []).map((s) => s.toLowerCase().trim()));

  // name -> summed quantity for that unit. Ingredients with no quantity, or
  // that mix units across recipes, fall back to a single unquantified line.
  const totals = new Map<string, { name: string; unit: string | null; quantity: number | null }>();

  for (const entry of entries ?? []) {
    const recipe = Array.isArray(entry.recipes) ? entry.recipes[0] : entry.recipes;
    if (!recipe) continue;
    for (const ing of recipe.ingredients ?? []) {
      const key = ing.name.toLowerCase().trim();
      if (staples.has(key)) continue;

      const existing = totals.get(key);
      if (!existing) {
        totals.set(key, { name: ing.name, unit: ing.unit, quantity: ing.quantity });
        continue;
      }
      // Same unit: add them up. Different units: drop to unquantified
      // rather than inventing a conversion.
      if (existing.unit === ing.unit && existing.quantity != null && ing.quantity != null) {
        existing.quantity += ing.quantity;
      } else {
        existing.quantity = null;
        existing.unit = null;
      }
    }
  }

  if (totals.size === 0) {
    return { added: 0, error: "Nothing to add — plan some recipes first." };
  }

  // Don't re-add what's already sitting unchecked on the list.
  const { data: existingItems } = await supabase
    .from("shopping_list_items")
    .select("name")
    .eq("household_id", household.id)
    .eq("checked", false)
    .returns<{ name: string }[]>();

  const alreadyListed = new Set(
    (existingItems ?? []).map((i) => i.name.toLowerCase().replace(/\s+/g, " ").trim()),
  );

  const lines = [...totals.values()]
    .map((t) => scaleIngredient({ name: t.name, quantity: t.quantity, unit: t.unit }, 1))
    .filter((line) => !alreadyListed.has(line.toLowerCase().replace(/\s+/g, " ").trim()));

  if (lines.length === 0) {
    return { added: 0, error: "Everything from this plan is already on the list." };
  }

  const { error } = await supabase.from("shopping_list_items").insert(
    lines.map((name) => ({ household_id: household.id, name, added_by: user.id })),
  );
  if (error) return { added: 0, error: error.message };

  revalidatePath("/shopping-list");
  return { added: lines.length, error: null };
}

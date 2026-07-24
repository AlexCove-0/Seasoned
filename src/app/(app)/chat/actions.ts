"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";
import type { RecipeDraft } from "@/lib/ai/tools";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function saveRecipe(recipe: RecipeDraft, transcript: ChatMessage[]) {
  const household = await getCurrentHousehold();
  if (!household) throw new Error("Not signed in to a household.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data: savedRecipe, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      household_id: household.id,
      title: recipe.title,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      base_servings: recipe.base_servings,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (recipeError) throw new Error(recipeError.message);

  const { error: conversationError } = await supabase.from("ai_conversations").insert({
    household_id: household.id,
    user_id: user.id,
    messages: transcript,
    resulting_recipe_id: savedRecipe.id,
  });

  if (conversationError) throw new Error(conversationError.message);

  return savedRecipe.id as string;
}

export async function bumpIngredientsUsage(names: string[]) {
  if (names.length === 0) return;

  const household = await getCurrentHousehold();
  if (!household) return;

  const supabase = await createClient();
  await supabase.rpc("bump_ingredients_usage", {
    p_household_id: household.id,
    p_names: names,
  });
}

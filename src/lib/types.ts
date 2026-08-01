export type Ingredient = { name: string; quantity: number | null; unit: string | null };
/**
 * `for_diner` marks a step that exists to accommodate one person (pulling a
 * portion before the sauce, plating theirs plain). Null on ordinary steps.
 * Recipes saved before this existed simply won't have the field.
 */
export type Step = {
  instruction: string;
  technique_note: string | null;
  for_diner?: string | null;
};

export type Recipe = {
  id: string;
  title: string;
  ingredients: Ingredient[];
  steps: Step[];
  base_servings: number;
  created_at: string;
  image_path: string | null;
};

export type CookLog = {
  id: string;
  cooked_at: string;
  servings_made: number | null;
  adjustments: string | null;
  rating: number | null;
  notes: string | null;
  image_path: string | null;
};

export type RecipeRating = {
  id: string;
  member_id: string;
  member_name: string;
  rating: number;
  comment: string | null;
  updated_at: string;
};

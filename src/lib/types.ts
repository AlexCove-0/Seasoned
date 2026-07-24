export type Ingredient = { name: string; quantity: number | null; unit: string | null };
export type Step = { instruction: string; technique_note: string | null };

export type Recipe = {
  id: string;
  title: string;
  ingredients: Ingredient[];
  steps: Step[];
  base_servings: number;
  created_at: string;
};

export type CookLog = {
  id: string;
  cooked_at: string;
  servings_made: number | null;
  adjustments: string | null;
  rating: number | null;
  notes: string | null;
};

export type RecipeRating = {
  id: string;
  member_id: string;
  member_name: string;
  rating: number;
  comment: string | null;
  updated_at: string;
};

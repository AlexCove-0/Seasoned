export type RankedRecipe = {
  id: string;
  title: string;
  base_servings: number;
  cook_logs: { rating: number | null; cooked_at: string }[];
};

export type RecipeCardData = {
  id: string;
  title: string;
  base_servings: number;
  subtitle: string;
};

/** Highest-rated, most-cooked recipes -- the ones worth going back to. */
export function topRecipes(recipes: RankedRecipe[], limit = 8): RecipeCardData[] {
  const cooked = recipes.filter((r) => r.cook_logs.length > 0);

  const scored = cooked.map((r) => {
    const rated = r.cook_logs.filter((l): l is { rating: number; cooked_at: string } => l.rating != null);
    const avgRating = rated.length > 0 ? rated.reduce((sum, l) => sum + l.rating, 0) / rated.length : 0;
    return { recipe: r, avgRating, cookCount: r.cook_logs.length };
  });

  scored.sort((a, b) => b.avgRating - a.avgRating || b.cookCount - a.cookCount);

  return scored.slice(0, limit).map(({ recipe, avgRating, cookCount }) => ({
    id: recipe.id,
    title: recipe.title,
    base_servings: recipe.base_servings,
    subtitle:
      avgRating > 0
        ? `${avgRating.toFixed(1)}★ · cooked ${cookCount}x`
        : `Cooked ${cookCount}x`,
  }));
}

/**
 * Recipes worth revisiting: never cooked, or cooked longest ago. Simple
 * recency heuristic, not a personalized recommendation -- resurfaces things
 * that might otherwise get forgotten in a growing recipe book.
 */
export function recommendedRecipes(
  recipes: RankedRecipe[],
  excludeIds: Set<string>,
  limit = 8,
): RecipeCardData[] {
  const candidates = recipes.filter((r) => !excludeIds.has(r.id));

  const withLastCooked = candidates.map((r) => {
    const lastCooked = r.cook_logs.reduce<string | null>((latest, l) => {
      if (!latest || l.cooked_at > latest) return l.cooked_at;
      return latest;
    }, null);
    return { recipe: r, lastCooked };
  });

  withLastCooked.sort((a, b) => {
    if (!a.lastCooked && !b.lastCooked) return 0;
    if (!a.lastCooked) return -1; // never cooked first
    if (!b.lastCooked) return 1;
    return a.lastCooked.localeCompare(b.lastCooked); // oldest first
  });

  return withLastCooked.slice(0, limit).map(({ recipe, lastCooked }) => ({
    id: recipe.id,
    title: recipe.title,
    base_servings: recipe.base_servings,
    subtitle: lastCooked ? `Last made ${new Date(lastCooked).toLocaleDateString()}` : "Never made yet",
  }));
}

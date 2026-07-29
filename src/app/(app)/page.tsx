import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";
import { RecipeCarousel } from "@/components/recipe-carousel";
import { topRecipes, recommendedRecipes, type RankedRecipe } from "@/lib/recipe-ranking";
import { RecipeList } from "./recipe-list";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const household = await getCurrentHousehold();
  if (!household) redirect("/household/setup");

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, title, base_servings, created_at")
    .order("created_at", { ascending: false })
    .returns<{ id: string; title: string; base_servings: number; created_at: string }[]>();

  const { data: recipesWithLogs } = await supabase
    .from("recipes")
    .select("id, title, base_servings, cook_logs(rating, cooked_at)")
    .returns<RankedRecipe[]>();

  const ranked = recipesWithLogs ?? [];
  const top = topRecipes(ranked);
  const recommended = recommendedRecipes(ranked, new Set(top.map((r) => r.id)));

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{household.name}</h1>
        <p className="text-sm text-neutral-500">Signed in as {household.display_name}</p>
      </header>

      <div className="flex gap-2">
        <Link
          href="/chat"
          className="flex-[2] rounded-xl bg-accent-600 px-4 py-3.5 text-center text-sm font-semibold text-white dark:bg-accent-400"
        >
          Cook up a new recipe
        </Link>
        <Link
          href="/import"
          className="flex-1 rounded-xl bg-neutral-100 px-4 py-3.5 text-center text-sm font-medium transition-colors hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
        >
          Import
        </Link>
      </div>

      <RecipeCarousel
        title="Top recipes"
        recipes={top}
        emptyText="Log a few cooks with a rating and your best dishes will show up here."
      />

      <RecipeCarousel
        title="Recommended"
        recipes={recommended}
        emptyText="Save a recipe and it'll show up here."
      />

      <section>
        <h2 className="mb-2.5 text-[11px] font-semibold tracking-[0.12em] text-neutral-500 uppercase">
          Your recipes
        </h2>
        {!recipes || recipes.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Nothing saved yet — start a conversation above.
          </p>
        ) : (
          <RecipeList recipes={recipes} />
        )}
      </section>
    </main>
  );
}

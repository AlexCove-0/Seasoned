import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StarDisplay } from "@/components/star-rating";
import { scaleIngredient } from "@/lib/scale-ingredients";
import type { Ingredient, Step } from "@/lib/types";
import { GuestRatingForm } from "./guest-rating-form";

type SharedRecipe = {
  recipe_id: string;
  title: string;
  ingredients: Ingredient[];
  steps: Step[];
  base_servings: number;
  avg_rating: number | null;
  rating_count: number;
};

export default async function SharedRecipePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data } = await supabase.rpc("get_shared_recipe", { p_token: token });
  const recipe = (data as SharedRecipe[] | null)?.[0];

  if (!recipe) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-10">
      <div>
        <p className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
          Shared from Seasoned
        </p>
        <h1 className="mt-1 text-2xl font-semibold">{recipe.title}</h1>
        <p className="text-sm text-neutral-500">Serves {recipe.base_servings}</p>
        {recipe.rating_count > 0 ? (
          <div className="mt-2 flex items-center gap-2">
            <StarDisplay value={recipe.avg_rating ?? 0} />
            <span className="text-sm text-neutral-500">
              {Number(recipe.avg_rating).toFixed(1)} ({recipe.rating_count}{" "}
              {recipe.rating_count === 1 ? "rating" : "ratings"})
            </span>
          </div>
        ) : null}
      </div>

      <section>
        <h2 className="mb-2 text-lg font-medium">Ingredients</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {recipe.ingredients.map((ing, i) => (
            <li key={i}>{scaleIngredient(ing, 1)}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Steps</h2>
        <ol className="flex flex-col gap-4">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex flex-col gap-1">
              <p className="text-sm">
                <span className="font-medium">{i + 1}.</span> {step.instruction}
              </p>
              {step.technique_note ? (
                <p className="ml-4 text-sm text-neutral-500">{step.technique_note}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <h2 className="text-lg font-medium">Leave a rating</h2>
        <GuestRatingForm token={token} />
      </section>
    </main>
  );
}

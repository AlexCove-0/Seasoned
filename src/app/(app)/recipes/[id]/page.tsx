import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CookLog, Recipe } from "@/lib/types";
import { CookLogForm } from "./cook-log-form";
import { RecipeIngredients } from "./recipe-ingredients";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: recipe } = await supabase
    .from("recipes")
    .select("id, title, ingredients, steps, base_servings, created_at")
    .eq("id", id)
    .maybeSingle<Recipe>();

  if (!recipe) notFound();

  const { data: cookLogs } = await supabase
    .from("cook_logs")
    .select("id, cooked_at, servings_made, adjustments, rating, notes")
    .eq("recipe_id", id)
    .order("cooked_at", { ascending: false })
    .returns<CookLog[]>();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-10">
      <div>
        <Link href="/" className="text-sm text-neutral-500 underline">
          &larr; Back
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{recipe.title}</h1>
        <p className="text-sm text-neutral-500">Serves {recipe.base_servings}</p>
      </div>

      <Link
        href={`/recipes/${recipe.id}/cook`}
        className="rounded-md bg-neutral-900 px-4 py-3 text-center text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
      >
        Start cooking
      </Link>

      <RecipeIngredients ingredients={recipe.ingredients} baseServings={recipe.base_servings} />

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

      <CookLogForm recipeId={recipe.id} defaultServings={recipe.base_servings} />

      <section>
        <h2 className="mb-2 text-lg font-medium">Cook history</h2>
        {!cookLogs || cookLogs.length === 0 ? (
          <p className="text-sm text-neutral-500">Not cooked yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {cookLogs.map((log) => (
              <li
                key={log.id}
                className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
              >
                <div className="flex justify-between text-neutral-500">
                  <span>{new Date(log.cooked_at).toLocaleDateString()}</span>
                  {log.rating ? <span>{"★".repeat(log.rating)}</span> : null}
                </div>
                {log.adjustments ? <p className="mt-1">Adjusted: {log.adjustments}</p> : null}
                {log.notes ? <p className="mt-1 text-neutral-500">{log.notes}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";
import type { CookLog, Recipe, RecipeRating } from "@/lib/types";
import { CookLogForm } from "./cook-log-form";
import { RecipeIngredients } from "./recipe-ingredients";
import { RecipeSteps } from "./recipe-steps";
import { RecipeRatings } from "./recipe-ratings";
import { RecipeShare } from "./recipe-share";

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

  const household = await getCurrentHousehold();
  if (!household) redirect("/household/setup");

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

  const { data: members } = await supabase
    .from("household_members")
    .select("id, display_name")
    .eq("household_id", household.id)
    .order("created_at", { ascending: true })
    .returns<{ id: string; display_name: string }[]>();

  const { data: ratingsRaw } = await supabase
    .from("recipe_ratings")
    .select("id, member_id, rating, comment, updated_at, household_members(display_name)")
    .eq("recipe_id", id)
    .returns<
      {
        id: string;
        member_id: string;
        rating: number;
        comment: string | null;
        updated_at: string;
        household_members: { display_name: string } | { display_name: string }[];
      }[]
    >();

  const ratings: RecipeRating[] = (ratingsRaw ?? []).map((r) => {
    const member = Array.isArray(r.household_members) ? r.household_members[0] : r.household_members;
    return {
      id: r.id,
      member_id: r.member_id,
      member_name: member?.display_name ?? "Someone",
      rating: r.rating,
      comment: r.comment,
      updated_at: r.updated_at,
    };
  });

  const { data: shares } = await supabase
    .from("recipe_shares")
    .select("id, share_token")
    .eq("recipe_id", id)
    .returns<{ id: string; share_token: string }[]>();

  const { data: guestRatings } = await supabase
    .from("guest_ratings")
    .select("id, guest_name, rating, comment")
    .eq("recipe_id", id)
    .order("created_at", { ascending: false })
    .returns<{ id: string; guest_name: string; rating: number; comment: string | null }[]>();

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
        className="rounded-md bg-accent-600 px-4 py-3 text-center text-sm font-medium text-white dark:bg-accent-400 dark:text-white"
      >
        Start cooking
      </Link>

      <RecipeIngredients ingredients={recipe.ingredients} baseServings={recipe.base_servings} />

      <RecipeSteps recipeId={recipe.id} steps={recipe.steps} />

      <RecipeRatings
        recipeId={recipe.id}
        members={members ?? []}
        ratings={ratings}
        guestRatings={guestRatings ?? []}
      />

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

      <RecipeShare recipeId={recipe.id} shares={shares ?? []} />
    </main>
  );
}

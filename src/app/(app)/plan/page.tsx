import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";
import { todayIso, weekFrom } from "@/lib/week";
import { PlanClient, type PlanEntry, type RecipeOption } from "./plan-client";

export default async function PlanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const household = await getCurrentHousehold();
  if (!household) redirect("/household/setup");

  const start = todayIso();
  const days = weekFrom(start);
  const end = days[days.length - 1];

  const { data: entriesRaw } = await supabase
    .from("meal_plan_entries")
    .select("id, planned_for, note, recipe_id, recipes(title, image_path)")
    .eq("household_id", household.id)
    .gte("planned_for", start)
    .lte("planned_for", end)
    .order("created_at", { ascending: true })
    .returns<
      {
        id: string;
        planned_for: string;
        note: string | null;
        recipe_id: string | null;
        recipes: { title: string; image_path: string | null } | { title: string; image_path: string | null }[] | null;
      }[]
    >();

  const entries: PlanEntry[] = (entriesRaw ?? []).map((e) => {
    const recipe = Array.isArray(e.recipes) ? e.recipes[0] : e.recipes;
    return {
      id: e.id,
      planned_for: e.planned_for,
      note: e.note,
      recipe_id: e.recipe_id,
      recipe_title: recipe?.title ?? null,
      recipe_image: recipe?.image_path ?? null,
    };
  });

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, title")
    .eq("household_id", household.id)
    .order("created_at", { ascending: false })
    .returns<RecipeOption[]>();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">This Week</h1>
        <p className="text-sm text-neutral-500">
          Plan dinners ahead, then pull the whole week&apos;s shopping in one go.
        </p>
      </div>

      <PlanClient days={days} entries={entries} recipes={recipes ?? []} />
    </main>
  );
}

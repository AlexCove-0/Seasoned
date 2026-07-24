import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";
import { RecipeCarousel } from "@/components/recipe-carousel";
import { topRecipes, recommendedRecipes, type RankedRecipe } from "@/lib/recipe-ranking";
import { HouseholdNameEditor } from "./household-name-editor";
import { ProfilesSection } from "./profiles-section";
import { AppliancesForm } from "./appliances-form";
import { PantryStaplesForm } from "./pantry-staples-form";

export type Member = {
  id: string;
  user_id: string | null;
  display_name: string;
  taste_preferences: string[];
  regional_tastes: string[];
  allergies: string[];
  is_favorite: boolean;
};

export default async function KitchenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const household = await getCurrentHousehold();
  if (!household) redirect("/household/setup");

  const { data: members } = await supabase
    .from("household_members")
    .select("id, user_id, display_name, taste_preferences, regional_tastes, allergies, is_favorite")
    .eq("household_id", household.id)
    .order("created_at", { ascending: true })
    .returns<Member[]>();

  const { data: householdRow } = await supabase
    .from("households")
    .select("appliances, pantry_staples")
    .eq("id", household.id)
    .single<{ appliances: string[]; pantry_staples: string[] }>();

  const { data: recipesWithLogs } = await supabase
    .from("recipes")
    .select("id, title, base_servings, cook_logs(rating, cooked_at)")
    .returns<RankedRecipe[]>();

  const recipes = recipesWithLogs ?? [];
  const top = topRecipes(recipes);
  const recommended = recommendedRecipes(recipes, new Set(top.map((r) => r.id)));

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-4 py-10">
      <HouseholdNameEditor name={household.name} />

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

      <ProfilesSection members={members ?? []} />

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-medium">Kitchen Settings</h2>
        <AppliancesForm defaultValue={householdRow?.appliances ?? []} />
        <PantryStaplesForm defaultValue={householdRow?.pantry_staples ?? []} />
      </section>
    </main>
  );
}

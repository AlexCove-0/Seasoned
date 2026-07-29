import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";
import { COMMON_INGREDIENTS } from "@/lib/taste-options";
import { ChatClient } from "./chat-client";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const household = await getCurrentHousehold();
  if (!household) redirect("/household/setup");

  const { data: members } = await supabase
    .from("household_members")
    .select("id, display_name, is_favorite")
    .eq("household_id", household.id)
    .order("created_at", { ascending: true })
    .returns<{ id: string; display_name: string; is_favorite: boolean }[]>();

  const { data: topIngredients } = await supabase
    .from("household_ingredients")
    .select("name")
    .eq("household_id", household.id)
    .order("use_count", { ascending: false })
    .limit(15)
    .returns<{ name: string }[]>();

  const { data: householdRow } = await supabase
    .from("households")
    .select("pantry_staples")
    .eq("id", household.id)
    .single<{ pantry_staples: string[] }>();

  // "On hand" means what you're actually planning to cook with tonight --
  // the protein, the vegetables you just bought. Pantry staples are givens
  // that are always in the kitchen, so suggesting them here is noise; they
  // reach the chef separately as assumed-available.
  const staples = new Set((householdRow?.pantry_staples ?? []).map((s) => s.toLowerCase()));

  // Case-insensitive dedup, keeping whichever casing is seen first -- the
  // common list is properly cased, so it wins over however someone happened
  // to type something into "on hand" in the past.
  const seen = new Map<string, string>();
  for (const name of [...COMMON_INGREDIENTS, ...(topIngredients ?? []).map((i) => i.name)]) {
    const key = name.toLowerCase();
    if (staples.has(key) || seen.has(key)) continue;
    seen.set(key, name);
  }
  const ingredientSuggestions = [...seen.values()];

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-6">
      <ChatClient members={members ?? []} topIngredients={ingredientSuggestions} />
    </main>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";
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

  const ingredientSuggestions = [
    ...new Set([...(householdRow?.pantry_staples ?? []), ...(topIngredients ?? []).map((i) => i.name)]),
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-6">
      <ChatClient members={members ?? []} topIngredients={ingredientSuggestions} />
    </main>
  );
}

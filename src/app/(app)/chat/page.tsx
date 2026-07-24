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
    .select("id, display_name")
    .eq("household_id", household.id)
    .order("created_at", { ascending: true })
    .returns<{ id: string; display_name: string }[]>();

  const { data: topIngredients } = await supabase
    .from("household_ingredients")
    .select("name")
    .eq("household_id", household.id)
    .order("use_count", { ascending: false })
    .limit(15)
    .returns<{ name: string }[]>();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-6">
      <ChatClient
        members={members ?? []}
        topIngredients={(topIngredients ?? []).map((i) => i.name)}
      />
    </main>
  );
}

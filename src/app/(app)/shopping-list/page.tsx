import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";
import { ShoppingListClient, type ShoppingItem } from "./shopping-list-client";

export default async function ShoppingListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const household = await getCurrentHousehold();
  if (!household) redirect("/household/setup");

  const { data: items } = await supabase
    .from("shopping_list_items")
    .select("id, name, checked")
    .eq("household_id", household.id)
    .order("created_at", { ascending: true })
    .returns<ShoppingItem[]>();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold">Shopping List</h1>
        <p className="text-sm text-neutral-500">
          Shared with everyone in {household.name} — anyone can add, check off, or clear
          items.
        </p>
      </div>
      <ShoppingListClient items={items ?? []} />
    </main>
  );
}

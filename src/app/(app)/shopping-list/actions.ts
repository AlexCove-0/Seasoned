"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";

export async function addItem(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const household = await getCurrentHousehold();
  if (!household) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("shopping_list_items").insert({
    household_id: household.id,
    name: trimmed,
    added_by: user.id,
  });

  revalidatePath("/shopping-list");
}

export async function toggleItem(id: string, checked: boolean) {
  const supabase = await createClient();
  await supabase.from("shopping_list_items").update({ checked }).eq("id", id);
  revalidatePath("/shopping-list");
}

export async function deleteItem(id: string) {
  const supabase = await createClient();
  await supabase.from("shopping_list_items").delete().eq("id", id);
  revalidatePath("/shopping-list");
}

export async function clearChecked() {
  const household = await getCurrentHousehold();
  if (!household) return;

  const supabase = await createClient();
  await supabase
    .from("shopping_list_items")
    .delete()
    .eq("household_id", household.id)
    .eq("checked", true);

  revalidatePath("/shopping-list");
}

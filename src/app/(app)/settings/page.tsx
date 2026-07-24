import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";
import { KitchenPreferencesForm } from "./kitchen-preferences-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const household = await getCurrentHousehold();
  if (!household) redirect("/household/setup");

  const { data: householdRow } = await supabase
    .from("households")
    .select("appliances")
    .eq("id", household.id)
    .single<{ appliances: string[] }>();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold">Kitchen Settings</h1>
        <p className="text-sm text-neutral-500">
          What&apos;s in your kitchen. This is separate from anyone&apos;s taste
          profile — see Profiles for that.
        </p>
      </div>

      <KitchenPreferencesForm defaultValue={householdRow?.appliances ?? []} />
    </main>
  );
}

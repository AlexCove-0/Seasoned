import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";
import { PersonCard } from "./person-card";
import { AddPersonForm } from "./add-person-form";
import { KitchenPreferencesForm } from "./kitchen-preferences-form";

export type Member = {
  id: string;
  user_id: string | null;
  display_name: string;
  taste_preferences: string[];
  regional_tastes: string[];
  allergies: string[];
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const household = await getCurrentHousehold();
  if (!household) redirect("/household/setup");

  const { data: members } = await supabase
    .from("household_members")
    .select("id, user_id, display_name, taste_preferences, regional_tastes, allergies")
    .eq("household_id", household.id)
    .order("created_at", { ascending: true })
    .returns<Member[]>();

  const { data: householdRow } = await supabase
    .from("households")
    .select("appliances")
    .eq("id", household.id)
    .single<{ appliances: string[] }>();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold">Kitchen Preferences</h1>
        <p className="text-sm text-neutral-500">
          Standing info lives here: each person&apos;s taste profile and allergies, plus
          what&apos;s in your kitchen. Regional style is chosen fresh each time you start a
          recipe, not set here.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Appliances</h2>
        <KitchenPreferencesForm defaultValue={householdRow?.appliances ?? []} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">People</h2>
        <div className="flex flex-col gap-3">
          {(members ?? []).map((m) => (
            <PersonCard key={m.id} member={m} />
          ))}
        </div>
        <AddPersonForm />
      </section>
    </main>
  );
}

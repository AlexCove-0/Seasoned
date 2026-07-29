import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";
import { HouseholdNameEditor } from "./household-name-editor";
import { InviteSection } from "./invite-section";
import { ProfilesSection } from "./profiles-section";
import { AppliancesForm } from "./appliances-form";
import { PantryStaplesForm } from "./pantry-staples-form";

export type Member = {
  id: string;
  user_id: string | null;
  display_name: string;
  taste_preferences: string[];
  disliked_tastes: string[];
  allergies: string[];
  is_favorite: boolean;
  invite_token: string;
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
    .select(
      "id, user_id, display_name, taste_preferences, disliked_tastes, allergies, is_favorite, invite_token",
    )
    .eq("household_id", household.id)
    .order("created_at", { ascending: true })
    .returns<Member[]>();

  const { data: householdRow } = await supabase
    .from("households")
    .select("appliances, pantry_staples")
    .eq("id", household.id)
    .single<{ appliances: string[]; pantry_staples: string[] }>();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-4 py-10">
      <HouseholdNameEditor name={household.name} />

      <ProfilesSection members={members ?? []} />

      <InviteSection householdName={household.name} inviteCode={household.invite_code} />

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-medium">Kitchen Settings</h2>
        <AppliancesForm defaultValue={householdRow?.appliances ?? []} />
        <PantryStaplesForm defaultValue={householdRow?.pantry_staples ?? []} />
      </section>
    </main>
  );
}

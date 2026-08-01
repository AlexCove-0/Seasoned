import { redirect } from "next/navigation";
import type { FlavorAxes } from "@/lib/flavor/axes";
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
  flavor_archetype: string | null;
  quiz_taken_at: string | null;
  is_picky_eater: boolean;
  safe_foods: string[];
  avoid_textures: string[];
  structure_rules: string[];
  flavor_axes: FlavorAxes | null;
};

export type ConnectedProfile = {
  user_id: string;
  display_name: string;
  taste_preferences: string[];
  disliked_tastes: string[];
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
    .select(
      "id, user_id, display_name, taste_preferences, disliked_tastes, allergies, is_favorite, invite_token, flavor_archetype, quiz_taken_at, is_picky_eater, safe_foods, avoid_textures, structure_rules, flavor_axes",
    )
    .eq("household_id", household.id)
    .order("created_at", { ascending: true })
    .returns<Member[]>();

  const { data: householdRow } = await supabase
    .from("households")
    .select("appliances, pantry_staples")
    .eq("id", household.id)
    .single<{ appliances: string[]; pantry_staples: string[] }>();

  // RLS on profiles only exposes rows shared with this user (plus their
  // own, excluded here) -- so this select IS the dining-room connection list.
  const { data: sharedProfiles } = await supabase
    .from("profiles")
    .select("user_id, display_name, taste_preferences, disliked_tastes, allergies")
    .neq("user_id", user.id)
    .returns<Omit<ConnectedProfile, "is_favorite">[]>();

  const { data: entries } = await supabase
    .from("dining_room_entries")
    .select("profile_user_id, is_favorite")
    .eq("household_id", household.id)
    .returns<{ profile_user_id: string; is_favorite: boolean }[]>();

  const favoriteByUser = new Map((entries ?? []).map((e) => [e.profile_user_id, e.is_favorite]));
  const connected: ConnectedProfile[] = (sharedProfiles ?? []).map((p) => ({
    ...p,
    is_favorite: favoriteByUser.get(p.user_id) ?? false,
  }));

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-4 py-10">
      <HouseholdNameEditor name={household.name} />

      <ProfilesSection members={members ?? []} connected={connected} />

      <InviteSection householdName={household.name} inviteCode={household.invite_code} />

      <section className="flex flex-col gap-2">
        <h2 className="mb-1 text-[11px] font-semibold tracking-[0.12em] text-neutral-500 uppercase">
          Kitchen Settings
        </h2>
        <AppliancesForm defaultValue={householdRow?.appliances ?? []} />
        <PantryStaplesForm defaultValue={householdRow?.pantry_staples ?? []} />
      </section>
    </main>
  );
}

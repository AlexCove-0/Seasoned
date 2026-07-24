import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";
import { PersonCard } from "./person-card";
import { AddPersonForm } from "./add-person-form";

export type Member = {
  id: string;
  user_id: string | null;
  display_name: string;
  taste_preferences: string[];
  regional_tastes: string[];
  allergies: string[];
};

export default async function ProfilesPage() {
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

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold">Profiles</h1>
        <p className="text-sm text-neutral-500">
          Each person&apos;s taste preferences and allergies. Recipes are tailored to
          whoever you pick as &quot;cooking for&quot; when you start one.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {(members ?? []).map((m) => (
          <PersonCard key={m.id} member={m} />
        ))}
      </div>
      <AddPersonForm />
    </main>
  );
}

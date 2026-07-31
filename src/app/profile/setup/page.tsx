import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileSetupForm } from "./form";

type ExistingProfile = {
  display_name: string;
  taste_preferences: string[];
  disliked_tastes: string[];
  allergies: string[];
};

export default async function ProfileSetupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("household_members")
    .select("display_name, taste_preferences, disliked_tastes, allergies")
    .eq("user_id", user.id)
    .maybeSingle<ExistingProfile>();

  if (!member) redirect("/household/setup");

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold">Help us get to know you better</h1>
        <p className="text-sm text-neutral-500">
          This shapes what Sazón suggests for you specifically. You can change any
          of it later from Kitchen Preferences.
        </p>
      </div>
      <ProfileSetupForm
        defaultDisplayName={member.display_name}
        defaultTastePreferences={member.taste_preferences}
        defaultDislikedTastes={member.disliked_tastes}
        defaultAllergies={member.allergies}
      />
    </main>
  );
}

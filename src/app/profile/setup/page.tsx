import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileSetupForm } from "./form";

export default async function ProfileSetupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("household_members")
    .select("display_name")
    .eq("user_id", user.id)
    .maybeSingle<{ display_name: string }>();

  if (!member) redirect("/household/setup");

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold">Help us get to know you better</h1>
        <p className="text-sm text-neutral-500">
          This shapes what Seasoned suggests for you specifically. You can change any
          of it later from Kitchen Preferences.
        </p>
      </div>
      <ProfileSetupForm defaultDisplayName={member.display_name} />
    </main>
  );
}

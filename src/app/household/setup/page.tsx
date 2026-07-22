import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";
import { HouseholdSetupForms } from "./forms";

export default async function HouseholdSetupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const existing = await getCurrentHousehold();
  if (existing) redirect("/");

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-4">
      <div>
        <h1 className="text-2xl font-semibold">Set up your kitchen</h1>
        <p className="text-sm text-neutral-500">
          Create a household to start saving recipes, or join one you&apos;ve been
          invited to.
        </p>
      </div>
      <HouseholdSetupForms />
    </main>
  );
}

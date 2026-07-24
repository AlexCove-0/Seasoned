import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";
import { ImportClient } from "./import-client";

export default async function ImportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const household = await getCurrentHousehold();
  if (!household) redirect("/household/setup");

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold">Import a recipe</h1>
        <p className="text-sm text-neutral-500">
          Paste a link or the recipe text, or upload a photo — a screenshot, a cookbook page,
          a handwritten card.
        </p>
      </div>
      <ImportClient />
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const household = await getCurrentHousehold();
  if (!household) redirect("/household/setup");

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, title, base_servings, created_at")
    .order("created_at", { ascending: false })
    .returns<{ id: string; title: string; base_servings: number; created_at: string }[]>();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold">{household.name}</h1>
        <p className="text-sm text-neutral-500">
          Signed in as {household.display_name} &middot; invite code{" "}
          <span className="font-mono">{household.invite_code}</span>
        </p>
      </header>

      <Link
        href="/chat"
        className="rounded-md bg-neutral-900 px-4 py-3 text-center text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
      >
        Cook up a new recipe
      </Link>

      <section>
        <h2 className="mb-2 text-lg font-medium">Your recipes</h2>
        {!recipes || recipes.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Nothing saved yet — start a conversation above.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recipes.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/recipes/${r.id}`}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
                >
                  <span>{r.title}</span>
                  <span className="text-neutral-500">Serves {r.base_servings}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

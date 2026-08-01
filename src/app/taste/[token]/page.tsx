import Link from "next/link";
import { notFound } from "next/navigation";
import { AxesChart } from "@/components/axes-chart";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "@/lib/household";
import type { FlavorAxes } from "@/lib/flavor/axes";
import { AddToKitchen } from "./add-to-kitchen";

type SharedResult = {
  display_name: string | null;
  flavor_axes: FlavorAxes;
  texture_flags: string[];
  flavor_archetype: string;
  created_at: string;
};

export default async function SharedTastePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_quiz_result", { p_token: token });
  const result = (data as SharedResult[] | null)?.[0];
  if (!result) notFound();

  // Signed-in cooks get the import button; everyone else gets the pitch.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const household = user ? await getCurrentHousehold() : null;

  const who = result.display_name?.trim();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-7 px-5 py-12">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold tracking-[0.14em] text-neutral-500 uppercase">
          {who ? `${who}'s flavor profile` : "A flavor profile"}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{result.flavor_archetype}</h1>
      </div>

      <AxesChart axes={result.flavor_axes} />

      {result.texture_flags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {result.texture_flags.map((flag) => (
            <span
              key={flag}
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
            >
              {flag}
            </span>
          ))}
        </div>
      ) : null}

      {household ? (
        <AddToKitchen
          token={token}
          defaultName={who ?? ""}
          householdName={household.name}
        />
      ) : (
        <div className="flex flex-col gap-3 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-900">
          <p className="text-sm font-medium">
            {who ? `Cooking for ${who}?` : "Cooking for them?"}
          </p>
          <p className="text-sm text-neutral-500">
            Sazón builds recipes around who&apos;s actually at the table — these seven numbers tell
            the chef how much heat, acid, or richness a dish really needs.
          </p>
          <Link
            href={`/login?next=${encodeURIComponent(`/taste/${token}`)}`}
            className="self-start rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white dark:bg-accent-400"
          >
            Add them to my kitchen
          </Link>
        </div>
      )}

      <p className="text-sm text-neutral-500">
        <Link href="/taste" className="underline underline-offset-2">
          Take the quiz yourself
        </Link>{" "}
        — two minutes, no account needed.
      </p>
    </main>
  );
}

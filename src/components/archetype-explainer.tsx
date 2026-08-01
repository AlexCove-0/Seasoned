import type { FlavorAxes } from "@/lib/flavor/axes";
import { describeProfile } from "@/lib/flavor/scoring";

/**
 * Reads someone's profile back to them in food language: what they reach
 * for, what to go easy on. The point is that the label should be legible as
 * a description of how you eat -- a name with no explanation behind it is
 * just a horoscope.
 *
 * Sentences are subjected to "Your palate" / "<Name>'s palate" so the axis
 * phrases (written third-person for the chef) stay grammatical with no verb
 * rewriting.
 */
export function ArchetypeExplainer({
  axes,
  archetype,
  name,
}: {
  axes: FlavorAxes;
  archetype: string;
  /** Omit for your own result; pass a name for someone else's. */
  name?: string;
}) {
  const traits = describeProfile(axes);
  const palate = name ? `${name}'s palate` : "Your palate";
  const you = name ?? "you";

  if (traits.length === 0) {
    return (
      <div className="flex flex-col gap-2 rounded-xl bg-neutral-100 p-4 text-sm dark:bg-neutral-900">
        <p className="font-medium">What this means</p>
        <p className="text-neutral-600 dark:text-neutral-400">
          {palate} sits near the middle on all seven spectra — nothing to steer hard around, which
          makes {you} genuinely easy to cook for. Recipes will play it down the middle unless{" "}
          {name ? "they ask" : "you ask"} for otherwise.
        </p>
      </div>
    );
  }

  const leadTrait = traits[0];
  const seeksOut = traits.filter((t) => t.high);
  const easyOn = traits.filter((t) => !t.high);

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-neutral-100 p-4 text-sm dark:bg-neutral-900">
      <div className="flex flex-col gap-1.5">
        <p className="font-medium">What this means at the table</p>
        <p className="text-neutral-600 dark:text-neutral-400">
          More than anything else, {palate.toLowerCase()} {leadTrait.claim}
          {" — that's the trait that sets "}
          {name ?? "you"} apart most from the average eater.
        </p>
      </div>

      {seeksOut.length > 0 ? (
        <TraitList title={`What ${you} reach${name ? "es" : ""} for`} traits={seeksOut} />
      ) : null}

      {easyOn.length > 0 ? (
        <TraitList title="What to go easy on" traits={easyOn} />
      ) : null}

      <p className="border-t border-neutral-200 pt-3 text-xs text-neutral-500 dark:border-neutral-800">
        Every recipe {name ? `made for ${name}` : "you cook"} gets these seven numbers, so the chef
        can judge how much heat, acid, or richness a dish actually needs — rather than guessing from
        a list of tags.
      </p>
    </div>
  );
}

function TraitList({
  title,
  traits,
}: {
  title: string;
  traits: ReturnType<typeof describeProfile>;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold tracking-[0.1em] text-neutral-500 uppercase">
        {title}
      </span>
      <ul className="flex flex-col gap-1.5">
        {traits.map((t) => (
          <li key={t.axisName} className="flex flex-col">
            <span className={t.strong ? "font-medium" : ""}>{capitalize(t.claim)}</span>
            {t.examples ? (
              <span className="text-neutral-500">{capitalize(t.examples)}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

"use client";

import { useState } from "react";
import { TagPicker } from "@/components/tag-picker";
import { AVOID_TEXTURES, STRUCTURE_RULES } from "@/lib/taste-options";

export type PickyEaterValues = {
  isPickyEater: boolean;
  safeFoods: string[];
  avoidTextures: string[];
  structureRules: string[];
};

/**
 * Progressive disclosure: one plain-language toggle, and the deeper questions
 * only appear for the families who need them. Everyone else keeps a short
 * setup. The toggle carries signal by itself -- even with every follow-up
 * skipped, the chef knows to keep this diner's portion simple and separable.
 *
 * "Picky eater" is deliberately how parents actually talk: no diagnosis
 * implied, and it reads the same to a parent of a typical 4-year-old and a
 * parent managing something more serious.
 */
export function PickyEaterFields({
  /** Whose profile this is; "" renders the second-person wording. */
  personName = "",
  defaults,
}: {
  personName?: string;
  defaults?: Partial<PickyEaterValues>;
}) {
  const [on, setOn] = useState(defaults?.isPickyEater ?? false);
  const who = personName.trim();

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-start gap-2.5 text-sm">
        <input
          type="checkbox"
          name="isPickyEater"
          checked={on}
          onChange={(e) => setOn(e.target.checked)}
          className="mt-0.5 h-4 w-4"
        />
        <span>
          {who ? `Is ${who} a picky eater?` : "Are you a picky eater?"}
          <span className="block text-xs text-neutral-500">
            Turns on a few extra questions so recipes work around textures and how food is
            served — not just flavor.
          </span>
        </span>
      </label>

      {on ? (
        <div className="flex flex-col gap-4 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-900">
          <div className="flex flex-col gap-1">
            <TagPicker
              name="safeFoods"
              label="Always-safe foods"
              suggestions={[]}
              defaultValue={defaults?.safeFoods}
              placeholder="Type a food and press Enter..."
            />
            <p className="text-xs text-neutral-500">
              What will {who || "you"} always eat? Be as specific as it needs to be — &ldquo;plain
              spaghetti with butter, no green flecks&rdquo; beats &ldquo;pasta.&rdquo;
            </p>
          </div>

          <TagPicker
            name="avoidTextures"
            label="Textures to avoid"
            suggestions={AVOID_TEXTURES}
            defaultValue={defaults?.avoidTextures}
          />

          <TagPicker
            name="structureRules"
            label="How food should be served"
            suggestions={STRUCTURE_RULES}
            defaultValue={defaults?.structureRules}
          />

          <p className="text-xs text-neutral-500">
            All optional — even just the checkbox helps. You can turn this off later as
            {who ? ` ${who}'s` : " your"} palate grows.
          </p>
        </div>
      ) : null}
    </div>
  );
}

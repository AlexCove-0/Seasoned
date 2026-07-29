"use client";

import { useState } from "react";
import { CollapsibleRow } from "@/components/collapsible-row";
import { TagPicker } from "@/components/tag-picker";
import { REGIONAL_CUISINES } from "@/lib/taste-options";

type Member = { id: string; display_name: string; is_favorite: boolean };

export type SessionConfig = {
  dinerIds: string[];
  servings: number;
  regionalTwist: string[];
  ingredientsOnHand: string[];
};

export function SessionSetup({
  members,
  topIngredients,
  onStart,
  starting,
}: {
  members: Member[];
  topIngredients: string[];
  onStart: (config: SessionConfig) => void;
  starting?: boolean;
}) {
  const favorites = members.filter((m) => m.is_favorite);
  const rest = members.filter((m) => !m.is_favorite);
  const [showAll, setShowAll] = useState(false);

  const [dinerIds, setDinerIds] = useState<string[]>(favorites.map((m) => m.id));
  const [servings, setServings] = useState(Math.max(favorites.length, 1));
  const [regionalTwist, setRegionalTwist] = useState<string[]>([]);
  const [ingredientsOnHand, setIngredientsOnHand] = useState<string[]>([]);

  function toggleDiner(id: string) {
    setDinerIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

  const visibleMembers = showAll ? members : favorites;

  return (
    <div className="flex flex-1 flex-col gap-7 pb-24">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tonight&apos;s cook</h1>
        <p className="text-sm text-neutral-500">
          Serves {servings} &middot; {dinerIds.length || "no"}{" "}
          {dinerIds.length === 1 ? "person" : "people"} at the table
        </p>
      </div>

      {members.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold tracking-[0.12em] text-neutral-500 uppercase">
            Cooking for
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {visibleMembers.map((m) => {
              const active = dinerIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleDiner(m.id)}
                  className={
                    active
                      ? "rounded-full bg-accent-600 px-3 py-1 text-xs font-medium text-white dark:bg-accent-400"
                      : "rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }
                >
                  {m.display_name}
                </button>
              );
            })}
            {!showAll && rest.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              >
                +{rest.length} more
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <TagPicker
        label="On hand"
        suggestions={topIngredients}
        placeholder="Add an ingredient…"
        onChange={setIngredientsOnHand}
      />

      <div className="flex flex-col gap-2">
        <CollapsibleRow
          label="Regional twist"
          summary={regionalTwist.length > 0 ? regionalTwist.join(", ") : "Any"}
        >
          <TagPicker
            suggestions={REGIONAL_CUISINES}
            placeholder="e.g. Mexican, Chinese…"
            onChange={setRegionalTwist}
          />
        </CollapsibleRow>

        <div className="flex items-center justify-between rounded-xl bg-neutral-100 px-4 py-3 dark:bg-neutral-900">
          <span className="text-sm font-medium">Portions</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setServings((s) => Math.max(1, s - 1))}
              aria-label="Fewer portions"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-sm dark:bg-neutral-800"
            >
              &minus;
            </button>
            <span className="w-5 text-center text-sm font-medium tabular-nums">{servings}</span>
            <button
              type="button"
              onClick={() => setServings((s) => Math.min(99, s + 1))}
              aria-label="More portions"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-sm dark:bg-neutral-800"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Pinned so the next step is always in reach instead of parked at the
          bottom of a long scroll. */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-neutral-200/60 bg-neutral-50/90 px-4 py-3 backdrop-blur dark:border-neutral-800/60 dark:bg-neutral-950/90">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={() => onStart({ dinerIds, servings, regionalTwist, ingredientsOnHand })}
            disabled={starting}
            className="w-full rounded-xl bg-accent-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 dark:bg-accent-400"
          >
            {starting ? "Thinking…" : "Find recipe ideas"}
          </button>
        </div>
      </div>
    </div>
  );
}

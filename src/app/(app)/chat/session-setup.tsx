"use client";

import { useState } from "react";
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
    <div className="flex flex-1 flex-col gap-6">
      <div className="max-w-sm">
        <TagPicker
          label="Ingredients on hand"
          suggestions={topIngredients}
          placeholder="Type an ingredient and press Enter..."
          onChange={setIngredientsOnHand}
        />
      </div>

      {members.length > 0 ? (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Cooking for</span>
          <div className="flex flex-wrap items-center gap-2">
            {visibleMembers.map((m) => {
              const active = dinerIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleDiner(m.id)}
                  className={
                    active
                      ? "rounded-full bg-accent-600 px-3 py-1 text-xs text-white dark:bg-accent-400 dark:text-white"
                      : "rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-500 dark:border-neutral-700"
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
                aria-label="Show more profiles"
                className="rounded-full border border-dashed border-neutral-300 px-2.5 py-1 text-xs text-neutral-400 hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:hover:text-white"
              >
                +
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <label className="flex w-20 flex-col gap-1 text-sm">
        <span className="font-medium">Portions</span>
        <input
          type="number"
          min={1}
          max={99}
          value={servings}
          onChange={(e) => setServings(Math.max(1, Number(e.target.value) || 1))}
          className="rounded-md border border-neutral-300 px-2 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      <div className="max-w-sm">
        <TagPicker
          label="Regional twist (optional)"
          suggestions={REGIONAL_CUISINES}
          placeholder="e.g. Mexican, Chinese..."
          onChange={setRegionalTwist}
        />
      </div>

      <button
        type="button"
        onClick={() => onStart({ dinerIds, servings, regionalTwist, ingredientsOnHand })}
        disabled={starting}
        className="self-start rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent-400 dark:text-white"
      >
        {starting ? "Thinking..." : "Find recipe ideas"}
      </button>
    </div>
  );
}

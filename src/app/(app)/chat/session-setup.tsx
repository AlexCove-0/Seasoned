"use client";

import { useState } from "react";
import { TagPicker } from "@/components/tag-picker";
import { REGIONAL_CUISINES } from "@/lib/taste-options";

type Member = { id: string; display_name: string };

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
}: {
  members: Member[];
  topIngredients: string[];
  onStart: (config: SessionConfig) => void;
}) {
  const [dinerIds, setDinerIds] = useState<string[]>(members.map((m) => m.id));
  const [servings, setServings] = useState(Math.max(members.length, 1));
  const [regionalTwist, setRegionalTwist] = useState<string[]>([]);
  const [ingredientsOnHand, setIngredientsOnHand] = useState<string[]>([]);

  function toggleDiner(id: string) {
    setDinerIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {members.length > 0 ? (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Cooking for</span>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const active = dinerIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleDiner(m.id)}
                  className={
                    active
                      ? "rounded-full bg-neutral-900 px-3 py-1 text-xs text-white dark:bg-white dark:text-neutral-900"
                      : "rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-500 dark:border-neutral-700"
                  }
                >
                  {m.display_name}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <label className="flex max-w-[10rem] flex-col gap-1 text-sm">
        <span className="font-medium">Portions</span>
        <input
          type="number"
          min={1}
          value={servings}
          onChange={(e) => setServings(Math.max(1, Number(e.target.value) || 1))}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      <TagPicker
        label="Regional twist (optional — leave blank for no particular style)"
        suggestions={REGIONAL_CUISINES}
        placeholder="e.g. Mexican, Chinese, Mediterranean..."
        onChange={setRegionalTwist}
      />

      <TagPicker
        label="Ingredients on hand"
        suggestions={topIngredients}
        placeholder="Type an ingredient and press Enter..."
        onChange={setIngredientsOnHand}
      />

      <button
        type="button"
        onClick={() => onStart({ dinerIds, servings, regionalTwist, ingredientsOnHand })}
        className="self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
      >
        Start cooking
      </button>
    </div>
  );
}

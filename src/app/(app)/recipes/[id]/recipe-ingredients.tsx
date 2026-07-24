"use client";

import { useState, useTransition } from "react";
import type { Ingredient } from "@/lib/types";
import { scaleIngredient } from "@/lib/scale-ingredients";
import { addToShoppingList } from "./actions";

export function RecipeIngredients({
  ingredients,
  baseServings,
}: {
  ingredients: Ingredient[];
  baseServings: number;
}) {
  const [servings, setServings] = useState(baseServings);
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  const multiplier = servings / baseServings;
  const scaled = ingredients.map((ing) => scaleIngredient(ing, multiplier));

  function handleAddToShoppingList() {
    setAdded(false);
    startTransition(async () => {
      await addToShoppingList(scaled);
      setAdded(true);
    });
  }

  return (
    <section className="rounded-2xl bg-neutral-100 p-5 dark:bg-neutral-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-accent-600 dark:text-accent-400">Ingredients</h2>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            aria-label="Fewer servings"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700"
          >
            &minus;
          </button>
          <span className="w-24 text-center text-neutral-500">
            Serves {servings}
            {servings !== baseServings ? ` (of ${baseServings})` : ""}
          </span>
          <button
            type="button"
            onClick={() => setServings((s) => s + 1)}
            aria-label="More servings"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700"
          >
            +
          </button>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5 text-sm">
        {scaled.map((line, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-accent-600 dark:text-accent-400">&bull;</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={handleAddToShoppingList}
        disabled={pending}
        className="mt-4 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-400"
      >
        {pending ? "Adding..." : added ? "Added to shopping list ✓" : "Add to shopping list"}
      </button>
    </section>
  );
}

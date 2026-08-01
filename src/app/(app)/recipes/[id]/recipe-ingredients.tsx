"use client";

import { useState, useTransition } from "react";
import type { Ingredient } from "@/lib/types";
import { scaleIngredient } from "@/lib/scale-ingredients";
import { IngredientChecklist } from "@/components/ingredient-checklist";
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
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [pending, startTransition] = useTransition();

  const multiplier = servings / baseServings;
  const scaled = ingredients.map((ing) => scaleIngredient(ing, multiplier));

  // Crossed-off means "already have it" -- so the list only gets what's left.
  const toBuy = scaled.filter((_, i) => !checked.has(i));

  function toggle(index: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleAddToShoppingList() {
    if (toBuy.length === 0) return;
    setAdded(false);
    startTransition(async () => {
      await addToShoppingList(toBuy);
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

      <IngredientChecklist lines={scaled} checked={checked} onToggle={toggle} />

      <p className="mt-1 text-xs text-neutral-400">
        Tap what you already have — the shopping list only gets the rest.
      </p>

      <button
        type="button"
        onClick={handleAddToShoppingList}
        disabled={pending || toBuy.length === 0}
        className="mt-3 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-400"
      >
        {pending
          ? "Adding..."
          : added
            ? "Added to shopping list ✓"
            : toBuy.length === 0
              ? "Nothing left to buy"
              : checked.size > 0
                ? `Add ${toBuy.length} to shopping list`
                : "Add to shopping list"}
      </button>
    </section>
  );
}

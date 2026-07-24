"use client";

import { useActionState } from "react";
import { logCook } from "./actions";

const inputClass =
  "rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900";

export function CookLogForm({
  recipeId,
  defaultServings,
}: {
  recipeId: string;
  defaultServings: number;
}) {
  const [state, formAction, pending] = useActionState(logCook.bind(null, recipeId), {
    error: null,
  });

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-neutral-300 p-4 dark:border-neutral-700">
      <h3 className="font-medium">Log this cook</h3>
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Servings made
          <input
            type="number"
            name="servingsMade"
            defaultValue={defaultServings}
            min={1}
            className={inputClass}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Rating (1-5)
          <input type="number" name="rating" min={1} max={5} className={inputClass} />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        What did you adjust?
        <textarea
          name="adjustments"
          rows={2}
          placeholder="Seared 1 min longer per side, skipped the foil rest..."
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Notes
        <textarea
          name="notes"
          rows={2}
          placeholder="How'd it turn out? Anything to try next time?"
          className={inputClass}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-accent-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent-400 dark:text-white"
      >
        {pending ? "Saving..." : "Save log"}
      </button>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
    </form>
  );
}

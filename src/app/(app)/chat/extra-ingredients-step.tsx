"use client";

import { useState } from "react";

export function ExtraIngredientsStep({
  suggestions,
  onContinue,
  loading,
}: {
  suggestions: string[];
  onContinue: (confirmed: string[]) => void;
  loading?: boolean;
}) {
  const [checked, setChecked] = useState<string[]>([]);

  function toggle(name: string) {
    setChecked((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h2 className="text-lg font-medium">Have any of these too?</h2>
        <p className="text-sm text-neutral-500">
          These would open up more options. Check off whatever you&apos;ve actually got.
        </p>
      </div>

      {suggestions.length === 0 ? (
        <p className="text-sm text-neutral-500">Nothing else needed — moving on.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {suggestions.map((name) => (
            <label
              key={name}
              className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800"
            >
              <input
                type="checkbox"
                checked={checked.includes(name)}
                onChange={() => toggle(name)}
                className="h-4 w-4"
              />
              {name}
            </label>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => onContinue(checked)}
        disabled={loading}
        className="self-start rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent-400 dark:text-white"
      >
        {loading ? "Thinking..." : "Show me recipe ideas"}
      </button>
    </div>
  );
}

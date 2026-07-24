"use client";

import { TagPicker } from "@/components/tag-picker";
import { REGIONAL_CUISINES } from "@/lib/taste-options";
import type { RecipeOption } from "@/lib/ai/tools";

export function RecipeOptionsStep({
  options,
  regionalTwist,
  onRegionalTwistChange,
  onRefresh,
  onSelect,
  loading,
}: {
  options: RecipeOption[];
  regionalTwist: string[];
  onRegionalTwistChange: (twist: string[]) => void;
  onRefresh: () => void;
  onSelect: (option: RecipeOption) => void;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h2 className="text-lg font-medium">Pick a direction</h2>
        <p className="text-sm text-neutral-500">
          Choose one to get the full recipe, or refresh for three new ideas.
        </p>
      </div>

      <div className="max-w-sm">
        <TagPicker
          label="Regional twist (optional)"
          suggestions={REGIONAL_CUISINES}
          defaultValue={regionalTwist}
          placeholder="e.g. Mexican, Chinese..."
          onChange={onRegionalTwistChange}
        />
      </div>

      {loading ? (
        <p className="text-sm text-neutral-400">Thinking of some ideas...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {options.map((option) => (
            <button
              key={option.title}
              type="button"
              onClick={() => onSelect(option)}
              className="flex flex-col gap-1 rounded-lg border border-neutral-200 p-4 text-left hover:border-accent-600 dark:border-neutral-800 dark:hover:border-accent-400"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{option.title}</span>
                {option.style ? (
                  <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800">
                    {option.style}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-neutral-500">{option.pitch}</p>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="self-start rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-neutral-700"
      >
        Refresh — show new ideas
      </button>
    </div>
  );
}

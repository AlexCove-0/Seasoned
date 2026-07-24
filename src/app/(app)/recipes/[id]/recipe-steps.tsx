"use client";

import { useEffect, useState } from "react";
import type { Step } from "@/lib/types";

export function RecipeSteps({ recipeId, steps }: { recipeId: string; steps: Step[] }) {
  const storageKey = `seasoned:doneSteps:${recipeId}`;
  const [done, setDone] = useState<Set<number>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  // Step progress is a per-device convenience (picking up where you left
  // off mid-cook), not household data -- localStorage is enough, no need
  // for a table/migration.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setDone(new Set(JSON.parse(raw) as number[]));
    } catch {
      // ignore -- worst case the checklist just starts empty
    }
    setHydrated(true);
  }, [storageKey]);

  function persist(next: Set<number>) {
    try {
      if (next.size === 0) localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, JSON.stringify([...next]));
    } catch {
      // ignore -- worst case progress doesn't survive a reload
    }
  }

  function toggle(i: number) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      persist(next);
      return next;
    });
  }

  return (
    <section className="rounded-2xl bg-neutral-100 p-5 dark:bg-neutral-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-orange-700 dark:text-orange-400">Steps</h2>
        {hydrated && done.size > 0 ? (
          <button
            type="button"
            onClick={() => {
              setDone(new Set());
              persist(new Set());
            }}
            className="text-xs text-neutral-500 underline"
          >
            Reset progress
          </button>
        ) : null}
      </div>

      <ol className="flex flex-col gap-3">
        {steps.map((step, i) => {
          const isDone = done.has(i);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                className="flex w-full items-start gap-3 text-left"
              >
                <span
                  className={
                    isDone
                      ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-600 text-xs text-white dark:bg-accent-400"
                      : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-400 text-xs text-neutral-500 dark:border-neutral-600 dark:text-neutral-400"
                  }
                >
                  {isDone ? "✓" : i + 1}
                </span>
                <span className="flex flex-col gap-1">
                  <span
                    className={
                      isDone
                        ? "text-sm text-neutral-400 line-through dark:text-neutral-600"
                        : "text-sm"
                    }
                  >
                    {step.instruction}
                  </span>
                  {step.technique_note ? (
                    <span
                      className={
                        isDone
                          ? "text-xs text-neutral-300 dark:text-neutral-700"
                          : "text-xs text-neutral-500"
                      }
                    >
                      {step.technique_note}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

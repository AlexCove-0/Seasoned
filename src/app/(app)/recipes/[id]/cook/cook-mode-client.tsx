"use client";

import Link from "next/link";
import { useState } from "react";
import type { Recipe } from "@/lib/types";

export function CookModeClient({ recipe }: { recipe: Recipe }) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = recipe.steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === recipe.steps.length - 1;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <Link href={`/recipes/${recipe.id}`} className="text-sm text-neutral-500 underline">
          &larr; Exit cooking mode
        </Link>
        <span className="text-sm text-neutral-500">
          Step {stepIndex + 1} of {recipe.steps.length}
        </span>
      </div>

      <h1 className="text-lg font-medium text-neutral-500">{recipe.title}</h1>

      <div className="flex flex-1 flex-col justify-center gap-4">
        <p className="text-2xl leading-snug font-medium">{step.instruction}</p>
        {step.technique_note ? (
          <p className="rounded-lg bg-neutral-100 p-4 text-lg text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            {step.technique_note}
          </p>
        ) : null}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={isFirst}
          className="flex-1 rounded-md border border-neutral-300 px-4 py-3 text-sm font-medium disabled:opacity-40 dark:border-neutral-700"
        >
          Back
        </button>
        {isLast ? (
          <Link
            href={`/recipes/${recipe.id}`}
            className="flex-1 rounded-md bg-neutral-900 px-4 py-3 text-center text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
          >
            Done — log this cook
          </Link>
        ) : (
          <button
            onClick={() => setStepIndex((i) => Math.min(recipe.steps.length - 1, i + 1))}
            className="flex-1 rounded-md bg-neutral-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
          >
            Next
          </button>
        )}
      </div>
    </main>
  );
}

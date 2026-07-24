"use client";

import Link from "next/link";
import { useState } from "react";

type RecipeSummary = { id: string; title: string; base_servings: number };

export function RecipeList({ recipes }: { recipes: RecipeSummary[] }) {
  const [query, setQuery] = useState("");

  const filtered =
    query.trim() === ""
      ? recipes
      : recipes.filter((r) => r.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="flex flex-col gap-3">
      {recipes.length > 3 ? (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your recipes..."
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      ) : null}

      {filtered.length === 0 ? (
        <p className="text-sm text-neutral-500">No recipes match &quot;{query}&quot;.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((r) => (
            <li key={r.id}>
              <Link
                href={`/recipes/${r.id}`}
                className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
              >
                <span>{r.title}</span>
                <span className="text-neutral-500">Serves {r.base_servings}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

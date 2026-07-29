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
          className="rounded-lg bg-neutral-100 px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-600/30 focus:outline-none dark:bg-neutral-900"
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
                className="flex items-center justify-between rounded-xl bg-neutral-100 px-4 py-3 text-sm transition-colors hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              >
                <span>{r.title}</span>
                <span className="text-xs text-neutral-500">Serves {r.base_servings}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

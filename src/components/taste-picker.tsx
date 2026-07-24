"use client";

import { useMemo, useState } from "react";

type TastePickerProps = {
  likedName: string;
  dislikedName: string;
  label: string;
  suggestions: readonly string[];
  defaultLiked?: string[];
  defaultDisliked?: string[];
};

/**
 * Like TagPicker, but each suggestion has two actions: click the label to
 * mark it as liked, click the small "-" on the right to mark it as
 * disliked. An item can only be in one list at a time.
 */
export function TastePicker({
  likedName,
  dislikedName,
  label,
  suggestions,
  defaultLiked = [],
  defaultDisliked = [],
}: TastePickerProps) {
  const [liked, setLiked] = useState<string[]>(defaultLiked);
  const [disliked, setDisliked] = useState<string[]>(defaultDisliked);
  const [query, setQuery] = useState("");

  function addLiked(raw: string) {
    const value = raw.trim();
    if (!value) return;
    setLiked((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setDisliked((prev) => prev.filter((t) => t !== value));
    setQuery("");
  }

  function addDisliked(value: string) {
    setDisliked((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setLiked((prev) => prev.filter((t) => t !== value));
  }

  const remaining = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = suggestions.filter((s) => !liked.includes(s) && !disliked.includes(s));
    if (!q) return pool.slice(0, 8);
    return pool.filter((s) => s.toLowerCase().includes(q)).slice(0, 8);
  }, [query, suggestions, liked, disliked]);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>

      {liked.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {liked.map((t) => (
            <span
              key={`l-${t}`}
              className="flex items-center gap-1 rounded-full bg-accent-600 px-2.5 py-1 text-xs text-white dark:bg-accent-400"
            >
              {t}
              <button
                type="button"
                onClick={() => setLiked((prev) => prev.filter((x) => x !== t))}
                aria-label={`Remove ${t}`}
                className="opacity-70 hover:opacity-100"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {disliked.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {disliked.map((t) => (
            <span
              key={`d-${t}`}
              className="flex items-center gap-1 rounded-full bg-neutral-200 px-2.5 py-1 text-xs text-neutral-500 line-through dark:bg-neutral-800"
            >
              {t}
              <button
                type="button"
                onClick={() => setDisliked((prev) => prev.filter((x) => x !== t))}
                aria-label={`Remove ${t}`}
                className="no-underline opacity-70 hover:opacity-100"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addLiked(query);
          }
        }}
        placeholder="Type to search or add your own..."
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />

      {remaining.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {remaining.map((s) => (
            <span
              key={s}
              className="flex items-stretch overflow-hidden rounded-full border border-neutral-300 dark:border-neutral-700"
            >
              <button
                type="button"
                onClick={() => addLiked(s)}
                className="px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                + {s}
              </button>
              <button
                type="button"
                onClick={() => addDisliked(s)}
                aria-label={`Dislike ${s}`}
                title={`I don't like ${s}`}
                className="border-l border-neutral-300 px-2 py-1 text-xs text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:border-neutral-700 dark:hover:bg-red-950 dark:hover:text-red-400"
              >
                &minus;
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {liked.map((t) => (
        <input key={`li-${t}`} type="hidden" name={likedName} value={t} />
      ))}
      {disliked.map((t) => (
        <input key={`di-${t}`} type="hidden" name={dislikedName} value={t} />
      ))}
    </div>
  );
}

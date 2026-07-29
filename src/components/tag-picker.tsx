"use client";

import { useMemo, useState } from "react";

type TagPickerProps = {
  name?: string;
  label?: string;
  suggestions: readonly string[];
  defaultValue?: string[];
  placeholder?: string;
  onChange?: (tags: string[]) => void;
};

/**
 * Multi-select tag input: click a suggestion to add it, or type something
 * not on the list and press Enter/comma to add it as a custom tag.
 *
 * Two ways to read the result: pass `name` to post selected tags as repeated
 * hidden form fields (server-action forms), or pass `onChange` to read the
 * tag list directly in client state (no form involved).
 *
 * Styling note: chips and the input are drawn as tonal fills, not outlines.
 * This control repeats a lot across the app, and a screen full of 1px
 * borders is the main thing that made it read as cluttered.
 */
export function TagPicker({
  name,
  label,
  suggestions,
  defaultValue = [],
  placeholder = "Type to search or add your own...",
  onChange,
}: TagPickerProps) {
  const [tags, setTags] = useState<string[]>(defaultValue);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suggestions.filter((s) => !tags.includes(s)).slice(0, 8);
    return suggestions
      .filter((s) => !tags.includes(s) && s.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, suggestions, tags]);

  function addTag(raw: string) {
    const value = raw.trim();
    if (!value || tags.includes(value)) return;
    const next = [...tags, value];
    setTags(next);
    setQuery("");
    onChange?.(next);
  }

  function removeTag(value: string) {
    const next = tags.filter((t) => t !== value);
    setTags(next);
    onChange?.(next);
  }

  return (
    <div className="flex flex-col gap-2.5">
      {label ? (
        <span className="text-[11px] font-semibold tracking-[0.12em] text-neutral-500 uppercase">
          {label}
        </span>
      ) : null}

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1.5 rounded-full bg-accent-600 px-3 py-1 text-xs font-medium text-white dark:bg-accent-400"
            >
              {t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                aria-label={`Remove ${t}`}
                className="opacity-60 hover:opacity-100"
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
            addTag(query);
          }
        }}
        placeholder={placeholder}
        className="rounded-lg bg-neutral-100 px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-600/30 focus:outline-none dark:bg-neutral-900"
      />

      {filtered.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 transition-colors hover:bg-accent-50 hover:text-accent-600 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      ) : query.trim() ? (
        <button
          type="button"
          onClick={() => addTag(query)}
          className="self-start text-xs text-neutral-500 underline underline-offset-2"
        >
          Add &quot;{query.trim()}&quot; as a custom option
        </button>
      ) : null}

      {name
        ? tags.map((t) => <input key={t} type="hidden" name={name} value={t} />)
        : null}
    </div>
  );
}

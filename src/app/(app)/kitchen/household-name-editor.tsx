"use client";

import { useState, useTransition } from "react";
import { updateHouseholdName } from "./kitchen-actions";

export function HouseholdNameEditor({ name }: { name: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [pending, startTransition] = useTransition();

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">{name}</h1>
        <button
          type="button"
          onClick={() => {
            setValue(name);
            setEditing(true);
          }}
          aria-label="Edit kitchen name"
          className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
        >
          ✎
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = value.trim();
        if (!trimmed) return;
        startTransition(async () => {
          await updateHouseholdName(trimmed);
          setEditing(false);
        });
      }}
      className="flex items-center gap-2"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xl font-semibold tracking-tight focus:ring-2 focus:ring-accent-600/30 focus:outline-none dark:bg-neutral-900"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent-600 px-2 py-1 text-xs font-medium text-white disabled:opacity-50 dark:bg-accent-400 dark:text-white"
      >
        {pending ? "Saving..." : "Save"}
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="text-xs text-neutral-500"
      >
        Cancel
      </button>
    </form>
  );
}

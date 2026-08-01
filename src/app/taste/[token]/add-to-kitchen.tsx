"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { addSharedResultToKitchen } from "../actions";

export function AddToKitchen({
  token,
  defaultName,
  householdName,
}: {
  token: string;
  defaultName: string;
  householdName: string;
}) {
  const [name, setName] = useState(defaultName);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (added) {
    return (
      <div className="flex flex-col gap-3 rounded-xl bg-accent-50 p-4 dark:bg-accent-950">
        <p className="text-sm font-medium">
          {name.trim()} is in {householdName}.
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Pick them at the start of a cook and the chef will build around their palate.
        </p>
        <Link
          href="/kitchen"
          className="self-start rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white dark:bg-accent-400"
        >
          Open my kitchen
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-900">
      <p className="text-sm font-medium">Add this profile to {householdName}</p>
      <p className="text-sm text-neutral-500">
        They&apos;ll show up in your dining room, and every recipe you cook for them accounts for
        these numbers.
      </p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Their name"
        className="rounded-lg bg-neutral-50 px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-600/30 focus:outline-none dark:bg-neutral-950"
      />
      <button
        type="button"
        disabled={pending || name.trim() === ""}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await addSharedResultToKitchen(token, name);
            if (res.error) setError(res.error);
            else setAdded(true);
          })
        }
        className="self-start rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-accent-400"
      >
        {pending ? "Adding..." : "Add to my kitchen"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

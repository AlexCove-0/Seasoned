"use client";

import { useState, useTransition } from "react";
import { createShareLink, revokeShareLink } from "./actions";

type Share = { id: string; share_token: string };

export function RecipeShare({ recipeId, shares }: { recipeId: string; shares: Share[] }) {
  const [pending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  function handleCreate() {
    startTransition(async () => {
      await createShareLink(recipeId);
    });
  }

  function handleCopy(share: Share) {
    const url = `${origin}/shared/${share.share_token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(share.id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">Share</h2>
      <p className="text-sm text-neutral-500">
        Anyone with the link can view this recipe and leave a rating and comment — no account
        needed.
      </p>

      {shares.map((share) => (
        <div
          key={share.id}
          className="flex items-center gap-2 rounded-md border border-neutral-200 p-2 text-sm dark:border-neutral-800"
        >
          <span className="flex-1 truncate text-neutral-500">
            {origin}/shared/{share.share_token}
          </span>
          <button
            type="button"
            onClick={() => handleCopy(share)}
            className="rounded-md border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700"
          >
            {copiedId === share.id ? "Copied ✓" : "Copy"}
          </button>
          <button
            type="button"
            onClick={() => startTransition(() => revokeShareLink(share.id, recipeId))}
            className="text-xs text-neutral-400 hover:text-red-600"
          >
            Revoke
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleCreate}
        disabled={pending}
        className="self-start rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium disabled:opacity-50 dark:border-neutral-700"
      >
        {pending ? "Creating..." : "+ Create a share link"}
      </button>
    </section>
  );
}

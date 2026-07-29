"use client";

import { useState } from "react";

export function InviteSection({
  householdName,
  inviteCode,
}: {
  householdName: string;
  inviteCode: string;
}) {
  const [copied, setCopied] = useState(false);
  const [fallbackText, setFallbackText] = useState<string | null>(null);

  async function sendInvite() {
    const url = `${window.location.origin}/household/setup?code=${inviteCode}`;
    const text = `Come cook with us! Join ${householdName} on Seasoned — use invite code ${inviteCode} or tap this link:`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: `Join ${householdName} on Seasoned`, text, url });
        return;
      } catch {
        return; // share sheet dismissed -- nothing to do
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No share sheet and clipboard blocked -- show the message to copy by hand.
      setFallbackText(`${text} ${url}`);
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-neutral-100 p-5 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Invite to your kitchen</h2>
        <span className="rounded-md bg-white px-2.5 py-1 font-mono text-sm tracking-widest dark:bg-neutral-800">
          {inviteCode}
        </span>
      </div>
      <p className="text-sm text-neutral-500">
        Send this to someone you cook for. They&apos;ll sign in with Google and create their own
        taste profile — it shows up in your dining room, yours shows up in theirs, and their
        updates reach you automatically.
      </p>
      <button
        type="button"
        onClick={sendInvite}
        className="self-start rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white dark:bg-accent-400 dark:text-white"
      >
        {copied ? "Invite copied!" : "Send invite"}
      </button>
      {fallbackText ? (
        <textarea
          readOnly
          value={fallbackText}
          onFocus={(e) => e.currentTarget.select()}
          rows={3}
          className="rounded-lg bg-white px-3 py-2 text-xs dark:bg-neutral-800"
        />
      ) : null}
    </section>
  );
}

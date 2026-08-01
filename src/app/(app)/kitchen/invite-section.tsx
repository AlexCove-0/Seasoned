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
  const [quizCopied, setQuizCopied] = useState(false);
  const [fallbackText, setFallbackText] = useState<string | null>(null);

  /**
   * The lighter-weight ask: no account, no kitchen, just take the quiz and
   * send back the result. For people who'll never install anything but whose
   * palate you still want on file.
   */
  async function sendQuiz() {
    const url = `${window.location.origin}/taste`;
    const text = "What kind of eater are you? Two-minute taste quiz — send me your result and I'll cook around it:";
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "What kind of eater are you?", text, url });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setQuizCopied(true);
      setTimeout(() => setQuizCopied(false), 2000);
    } catch {
      setFallbackText(`${text} ${url}`);
    }
  }

  async function sendInvite() {
    const url = `${window.location.origin}/household/setup?code=${inviteCode}`;
    const text = `Come cook with us! Join ${householdName} on Sazón — use invite code ${inviteCode} or tap this link:`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: `Join ${householdName} on Sazón`, text, url });
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
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={sendInvite}
          className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white dark:bg-accent-400 dark:text-white"
        >
          {copied ? "Invite copied!" : "Send invite"}
        </button>
        <button
          type="button"
          onClick={sendQuiz}
          className="rounded-md bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
        >
          {quizCopied ? "Quiz link copied!" : "Just send the taste quiz"}
        </button>
      </div>
      <p className="text-xs text-neutral-500">
        Not everyone wants an account. The quiz link needs no sign-up — they take it, and send
        their result back for you to drop into your dining room.
      </p>
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

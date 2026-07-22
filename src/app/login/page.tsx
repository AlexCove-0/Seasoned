"use client";

import { useActionState } from "react";
import { sendMagicLink } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(sendMagicLink, {
    error: null,
    sent: false,
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold">Seasoned</h1>
        <p className="text-sm text-neutral-500">
          Your personal chef instructor. Sign in with your email — no password
          needed.
        </p>
      </div>

      {state.sent ? (
        <p className="rounded-md border border-green-600/30 bg-green-600/10 p-3 text-sm">
          Check your email for a sign-in link.
        </p>
      ) : (
        <form action={formAction} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            {pending ? "Sending..." : "Send sign-in link"}
          </button>
          {state.error ? (
            <p className="text-sm text-red-600">{state.error}</p>
          ) : null}
        </form>
      )}
    </main>
  );
}

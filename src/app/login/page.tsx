"use client";

import { useActionState, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMagicLink } from "./actions";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.1C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(sendMagicLink, {
    error: null,
    sent: false,
  });
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setGoogleLoading(true);
    setGoogleError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/confirm?next=/` },
    });
    if (error) {
      setGoogleError(error.message);
      setGoogleLoading(false);
    }
    // On success the browser navigates away to Google, so nothing left to do here.
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold">Seasoned</h1>
        <p className="text-sm text-neutral-500">
          Your personal chef instructor. No password needed.
        </p>
      </div>

      {state.sent ? (
        <p className="rounded-md border border-green-600/30 bg-green-600/10 p-3 text-sm">
          Check your email for a sign-in link.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={googleLoading}
            className="flex items-center justify-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium disabled:opacity-50 dark:border-neutral-700"
          >
            <GoogleIcon />
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>
          {googleError ? <p className="text-sm text-red-600">{googleError}</p> : null}

          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            or
            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>

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
              className="rounded-md bg-accent-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent-400 dark:text-white"
            >
              {pending ? "Sending..." : "Send sign-in link"}
            </button>
            {state.error ? (
              <p className="text-sm text-red-600">{state.error}</p>
            ) : null}
          </form>
        </div>
      )}
    </main>
  );
}

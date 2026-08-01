"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.68 18.63.5 12 .5S0 5.68 0 12.07c0 5.77 4.39 10.56 10.13 11.43v-8.08H7.08v-3.35h3.05V9.41c0-2.99 1.79-4.64 4.53-4.64 1.31 0 2.68.23 2.68.23v2.92h-1.51c-1.49 0-1.95.92-1.95 1.86v2.24h3.32l-.53 3.35h-2.79v8.08C19.61 22.63 24 17.84 24 12.07Z"
      />
    </svg>
  );
}

type Provider = "google" | "facebook";

export default function LoginPage() {
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(provider: Provider) {
    setLoading(provider);
    setError(null);
    const supabase = createClient();
    // Carry a ?next= destination (e.g. an invite's join link) through the
    // OAuth round trip; /auth/confirm redirects there after sign-in.
    const next = new URLSearchParams(window.location.search).get("next") ?? "/";
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(null);
    }
    // On success the browser navigates away to the provider, so nothing left to do here.
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Sazón</h1>
        <p className="text-sm text-neutral-500">Your personal chef instructor.</p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => signIn("google")}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium disabled:opacity-50 dark:border-neutral-700"
        >
          <GoogleIcon />
          {loading === "google" ? "Redirecting..." : "Continue with Google"}
        </button>
        <button
          type="button"
          onClick={() => signIn("facebook")}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium disabled:opacity-50 dark:border-neutral-700"
        >
          <FacebookIcon />
          {loading === "facebook" ? "Redirecting..." : "Continue with Facebook"}
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </main>
  );
}

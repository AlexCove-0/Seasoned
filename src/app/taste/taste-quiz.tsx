"use client";

import { useState, useTransition } from "react";
import { AxesChart } from "@/components/axes-chart";
import { QuizFlow } from "@/components/quiz-flow";
import type { FlavorAxes } from "@/lib/flavor/axes";
import type { QuizResult } from "@/lib/flavor/scoring";
import { namePublicQuizResult, savePublicQuizResult } from "./actions";

type Saved = { axes: FlavorAxes; archetype: string; token: string };

export function TasteQuiz() {
  const [started, setStarted] = useState(false);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, startSaving] = useTransition();

  function handleScored(scored: QuizResult) {
    startSaving(async () => {
      const res = await savePublicQuizResult(
        "",
        scored.axes,
        scored.textureFlags,
        scored.archetype,
      );
      if (res.error || !res.token) {
        setError(res.error ?? "Couldn't save that result.");
        return;
      }
      setSaved({ axes: scored.axes, archetype: scored.archetype, token: res.token });
    });
  }

  if (saved) return <Result saved={saved} />;

  if (!started) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-[0.14em] text-neutral-500 uppercase">
            Sazón
          </p>
          <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance">
            What kind of eater are you?
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Fourteen quick either/or questions — no right answers, nothing to sign up for. You&apos;ll
            get your palate mapped across seven spectra that people genuinely split on, like whether
            bitterness reads as depth or as punishment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setStarted(true)}
          className="self-start rounded-xl bg-accent-600 px-5 py-3 text-sm font-semibold text-white dark:bg-accent-400"
        >
          Start the quiz
        </button>

        <p className="text-sm text-neutral-500">
          Takes about two minutes. At the end you can send your result to whoever does the cooking.
        </p>
      </div>
    );
  }

  return <QuizFlow onScored={handleScored} busy={busy} error={error} />;
}

function Result({ saved }: { saved: Saved }) {
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const [namePending, startNaming] = useTransition();

  const url = typeof window !== "undefined" ? `${window.location.origin}/taste/${saved.token}` : "";

  async function share() {
    const trimmed = name.trim();
    if (trimmed) startNaming(() => namePublicQuizResult(saved.token, trimmed));

    const text = trimmed
      ? `${trimmed}'s taste profile: ${saved.archetype}`
      : `My taste profile: ${saved.archetype}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Taste profile", text, url });
        return;
      } catch {
        return; // share sheet dismissed
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold tracking-[0.14em] text-neutral-500 uppercase">
          Your flavor profile
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{saved.archetype}</h1>
      </div>

      <AxesChart axes={saved.axes} />

      <div className="flex flex-col gap-3 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-900">
        <p className="text-sm font-medium">Send this to whoever cooks for you</p>
        <p className="text-sm text-neutral-500">
          They can drop it straight into their kitchen, and every recipe they make will account for
          your palate.
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (so they know whose this is)"
          className="rounded-lg bg-neutral-50 px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-600/30 focus:outline-none dark:bg-neutral-950"
        />
        <button
          type="button"
          onClick={share}
          disabled={namePending}
          className="self-start rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-accent-400"
        >
          {copied ? "Link copied!" : "Share my result"}
        </button>
      </div>

      <p className="text-sm text-neutral-500">
        Sazón is a cooking app that builds recipes around who&apos;s actually at the table.{" "}
        <a href="/login" className="underline underline-offset-2">
          Make your own kitchen
        </a>{" "}
        if you want to keep yours.
      </p>
    </div>
  );
}

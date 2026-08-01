"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ArchetypeExplainer } from "@/components/archetype-explainer";
import { AxesChart } from "@/components/axes-chart";
import { QuizFlow, type QuizSession } from "@/components/quiz-flow";
import type { FlavorAxes } from "@/lib/flavor/axes";
import { buildQuizSet, type QuizQuestion } from "@/lib/flavor/quiz";
import { pickDeeperRound, type QuizResult } from "@/lib/flavor/scoring";
import { saveQuizResult } from "./actions";

type Previous = { axes: FlavorAxes; takenAt: string } | null;

export function QuizClient({
  memberId,
  personName,
  doneHref,
  previous,
}: {
  memberId?: string;
  personName: string;
  doneHref: string;
  previous: Previous;
}) {
  // Retakes get a varied set so coming back isn't re-answering last time's
  // quiz from memory.
  const initialQuestions = useMemo(() => buildQuizSet({ retake: previous !== null }), [previous]);

  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [result, setResult] = useState<{ axes: FlavorAxes; archetype: string } | null>(null);
  const [deepening, setDeepening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  function handleScored(scored: QuizResult, s: QuizSession) {
    startSaving(async () => {
      const saved = await saveQuizResult(
        scored.axes,
        scored.textureFlags,
        scored.archetype,
        memberId,
      );
      if (saved.error) {
        setError(saved.error);
        return;
      }
      setSession(s);
      setDeepening(false);
      setResult({ axes: scored.axes, archetype: scored.archetype });
    });
  }

  function goDeeper() {
    if (!session) return;
    const extra = pickDeeperRound(session.answers, session.asked);
    if (extra.length === 0) return;
    setQuestions([...session.asked, ...extra]);
    setDeepening(true);
    setResult(null);
  }

  if (result && session && !deepening) {
    const deeperAvailable = pickDeeperRound(session.answers, session.asked).length;
    return (
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold tracking-[0.14em] text-neutral-500 uppercase">
            {personName}&apos;s flavor profile
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{result.archetype}</h1>
        </div>

        <AxesChart axes={result.axes} previous={previous?.axes ?? null} />

        <ArchetypeExplainer axes={result.axes} archetype={result.archetype} />

        <p className="text-sm text-neutral-500">
          {previous
            ? "The faint marks show where you were last time — palates move, and now we can see which way."
            : "Every recipe from here on gets these seven numbers, not just a list of tags, so the chef can judge how much heat, acid, or richness a dish actually needs."}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={doneHref}
            className="rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white dark:bg-accent-400"
          >
            Done
          </Link>
          {deeperAvailable > 0 ? (
            <button
              type="button"
              onClick={goDeeper}
              className="rounded-xl bg-neutral-100 px-5 py-2.5 text-sm font-medium dark:bg-neutral-900"
            >
              Sharpen it — {deeperAvailable} more question{deeperAvailable === 1 ? "" : "s"}
            </button>
          ) : null}
        </div>
        {deeperAvailable > 0 ? (
          <p className="-mt-4 text-xs text-neutral-500">
            Extra questions aim at whichever spectra are still blurriest, and this result is
            already saved — going deeper only refines it.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <QuizFlow
      key={questions.length}
      questions={questions}
      initialAnswers={session?.answers ?? {}}
      onScored={handleScored}
      busy={saving}
      error={error}
      skip={{ href: doneHref, label: "Skip for now" }}
    />
  );
}

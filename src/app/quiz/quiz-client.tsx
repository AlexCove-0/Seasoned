"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { AXES, type FlavorAxes } from "@/lib/flavor/axes";
import { CORE_QUIZ, type QuizQuestion } from "@/lib/flavor/quiz";
import { pickTieBreakers, scoreQuiz, type QuizAnswers } from "@/lib/flavor/scoring";
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
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [followUps, setFollowUps] = useState<QuizQuestion[]>([]);
  const [result, setResult] = useState<{ axes: FlavorAxes; archetype: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  // Core questions first; follow-ups get appended once the core round
  // reveals which axes we still don't understand about this person.
  const questions = useMemo(() => [...CORE_QUIZ, ...followUps], [followUps]);
  const question = questions[index];
  const total = questions.length;

  function finish(finalAnswers: QuizAnswers, asked: QuizQuestion[]) {
    const scored = scoreQuiz(finalAnswers, asked);
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
      setResult({ axes: scored.axes, archetype: scored.archetype });
    });
  }

  function choose(optionId: string) {
    const next = { ...answers, [question.id]: optionId };
    setAnswers(next);

    const isLastCore = index === CORE_QUIZ.length - 1 && followUps.length === 0;
    if (isLastCore) {
      const extra = pickTieBreakers(next);
      if (extra.length > 0) {
        setFollowUps(extra);
        setIndex(index + 1);
        return;
      }
      finish(next, CORE_QUIZ);
      return;
    }

    if (index < questions.length - 1) {
      setIndex(index + 1);
      return;
    }

    finish(next, questions);
  }

  if (result) {
    return (
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold tracking-[0.14em] text-neutral-500 uppercase">
            {personName}&apos;s flavor profile
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{result.archetype}</h1>
        </div>

        <div className="flex flex-col gap-4">
          {AXES.map((axis) => {
            const value = result.axes[axis.id];
            const before = previous?.axes?.[axis.id];
            const drift = typeof before === "number" ? value - before : null;
            return (
              <div key={axis.id} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-medium">{axis.name}</span>
                  <span className="font-mono text-neutral-400">
                    {drift !== null && Math.abs(drift) >= 5 ? (
                      <span className="mr-1.5 text-accent-600 dark:text-accent-400">
                        {drift > 0 ? "▲" : "▼"}
                        {Math.abs(drift)}
                      </span>
                    ) : null}
                    {value}
                  </span>
                </div>
                <div className="relative h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800">
                  {typeof before === "number" ? (
                    <span
                      className="absolute -top-0.5 h-2.5 w-0.5 -translate-x-1/2 rounded bg-neutral-400 dark:bg-neutral-600"
                      style={{ left: `${before}%` }}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span
                    className="absolute -top-1 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-neutral-50 bg-accent-600 dark:border-neutral-950 dark:bg-accent-400"
                    style={{ left: `${value}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>{axis.lowPole}</span>
                  <span>{axis.highPole}</span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-sm text-neutral-500">
          {previous
            ? "The faint marks show where you were last time — palates move, and now we can see which way."
            : "Every recipe from here on gets these seven numbers, not just a list of tags, so the chef can judge how much heat, acid, or richness a dish actually needs."}
        </p>

        <Link
          href={doneHref}
          className="self-start rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white dark:bg-accent-400"
        >
          Done
        </Link>
      </div>
    );
  }

  const progress = (index / total) * 100;

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <div className="h-1 w-full rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-1 rounded-full bg-accent-600 transition-[width] duration-300 dark:bg-accent-400"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span className="font-mono">
            {String(index + 1).padStart(2, "0")} / {total}
            {question?.resolves ? " · narrowing in" : ""}
          </span>
          <Link href={doneHref} className="underline underline-offset-2">
            Skip for now
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {question.scene ? (
          <p className="text-xs font-semibold tracking-[0.14em] text-neutral-500 uppercase">
            {question.scene}
          </p>
        ) : null}
        <h1 className="text-2xl leading-snug font-semibold tracking-tight text-balance">
          {question.prompt}
        </h1>
      </div>

      <div className="flex flex-col gap-2.5">
        {question.options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={saving}
            onClick={() => choose(option.id)}
            className="rounded-xl bg-neutral-100 p-4 text-left transition-colors hover:bg-accent-50 disabled:opacity-50 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            <span className="block text-sm font-semibold">{option.label}</span>
            <span className="mt-0.5 block text-sm text-neutral-500">{option.detail}</span>
          </button>
        ))}
      </div>

      {index > 0 ? (
        <button
          type="button"
          onClick={() => setIndex(index - 1)}
          className="self-start text-xs text-neutral-500 underline underline-offset-2"
        >
          Back
        </button>
      ) : null}

      {saving ? <p className="text-sm text-neutral-400">Scoring…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

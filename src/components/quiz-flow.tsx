"use client";

import { useMemo, useState } from "react";
import { CORE_QUIZ, type QuizQuestion } from "@/lib/flavor/quiz";
import { pickTieBreakers, scoreQuiz, type QuizAnswers, type QuizResult } from "@/lib/flavor/scoring";

/**
 * The question-asking half of the quiz, with no opinion about who the answers
 * belong to or where they get saved. Both the signed-in version (saving to a
 * profile) and the public version (saving to a shareable token) wrap this.
 */
export function QuizFlow({
  onScored,
  busy = false,
  error = null,
  skip = null,
}: {
  onScored: (result: QuizResult) => void;
  busy?: boolean;
  error?: string | null;
  /** Optional escape hatch, e.g. "Skip for now" back into the app. */
  skip?: { href: string; label: string } | null;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [followUps, setFollowUps] = useState<QuizQuestion[]>([]);

  // Core questions first; follow-ups get appended once the core round
  // reveals which axes we still don't understand about this person.
  const questions = useMemo(() => [...CORE_QUIZ, ...followUps], [followUps]);
  const question = questions[index];
  const total = questions.length;

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
      onScored(scoreQuiz(next, CORE_QUIZ));
      return;
    }

    if (index < questions.length - 1) {
      setIndex(index + 1);
      return;
    }

    onScored(scoreQuiz(next, questions));
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
          <span className="font-mono tabular-nums">
            {String(index + 1).padStart(2, "0")} / {total}
            {question?.resolves ? " · narrowing in" : ""}
          </span>
          {skip ? (
            <a href={skip.href} className="underline underline-offset-2">
              {skip.label}
            </a>
          ) : null}
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
            disabled={busy}
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

      {busy ? <p className="text-sm text-neutral-400">Scoring…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

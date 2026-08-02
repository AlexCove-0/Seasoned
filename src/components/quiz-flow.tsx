"use client";

import { useMemo, useState } from "react";
import type { QuizQuestion } from "@/lib/flavor/quiz";
import { pickTieBreakers, scoreQuiz, type QuizAnswers, type QuizResult } from "@/lib/flavor/scoring";

export type QuizSession = { answers: QuizAnswers; asked: QuizQuestion[] };

/**
 * The question-asking half of the quiz, with no opinion about who the
 * answers belong to or where they get saved. Both the signed-in version and
 * the public version wrap this.
 *
 * `initialAnswers` supports the "go deeper" rounds: the parent re-renders
 * this with the previous sitting's answers plus freshly picked questions
 * appended, and the flow resumes at the first unanswered one.
 */
export function QuizFlow({
  questions,
  initialAnswers = {},
  onScored,
  busy = false,
  error = null,
  skip = null,
}: {
  questions: QuizQuestion[];
  initialAnswers?: QuizAnswers;
  onScored: (result: QuizResult, session: QuizSession) => void;
  busy?: boolean;
  error?: string | null;
  /** Optional escape hatch, e.g. "Skip for now" back into the app. */
  skip?: { href: string; label: string } | null;
}) {
  const resuming = Object.keys(initialAnswers).length > 0;
  const firstUnanswered = useMemo(() => {
    const idx = questions.findIndex((q) => !(q.id in initialAnswers));
    return idx === -1 ? 0 : idx;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [index, setIndex] = useState(firstUnanswered);
  const [answers, setAnswers] = useState<QuizAnswers>(initialAnswers);
  const [followUps, setFollowUps] = useState<QuizQuestion[]>([]);

  // Base questions first; tie-breakers get appended once the base round
  // reveals which axes we still don't understand about this person.
  const allQuestions = useMemo(() => [...questions, ...followUps], [questions, followUps]);
  const question = allQuestions[index];
  const total = allQuestions.length;

  function choose(optionId: string) {
    const next = { ...answers, [question.id]: optionId };
    setAnswers(next);

    const isLastBase = index === questions.length - 1 && followUps.length === 0;
    if (isLastBase && !resuming) {
      const extra = pickTieBreakers(next, questions);
      if (extra.length > 0) {
        setFollowUps(extra);
        setIndex(index + 1);
        return;
      }
      onScored(scoreQuiz(next, questions), { answers: next, asked: questions });
      return;
    }

    if (index < allQuestions.length - 1) {
      setIndex(index + 1);
      return;
    }

    onScored(scoreQuiz(next, allQuestions), { answers: next, asked: allQuestions });
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
            {question?.resolves && !resuming ? " · narrowing in" : ""}
            {resuming ? " · going deeper" : ""}
          </span>
          {skip ? (
            <a href={skip.href} className="underline underline-offset-2">
              {skip.label}
            </a>
          ) : null}
        </div>
      </div>

      {/* Everything here is sized up from where it started. The scene sets up
          the question and the option details carry the actual substance, and
          both were previously small, low-contrast text that people over 40
          simply could not read on a phone. Body copy in this app is read at
          arm's length in a kitchen -- it should be generous by default. */}
      <div className="flex flex-col gap-2">
        {question.scene ? (
          <p className="text-lg leading-snug text-neutral-700 text-balance dark:text-neutral-300">
            {question.scene}
          </p>
        ) : null}
        <h1 className="text-2xl leading-snug font-semibold tracking-tight text-balance">
          {question.prompt}
        </h1>
      </div>

      {/* The rule separates question from answers: without it the eye slides
          from the heading straight into the first card and skips the setup. */}
      <div className="flex flex-col gap-2.5 border-t border-neutral-200 pt-5 dark:border-neutral-800">
        {question.options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={busy}
            onClick={() => choose(option.id)}
            className="rounded-xl bg-neutral-100 p-4 text-left transition-colors hover:bg-accent-50 disabled:opacity-50 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            <span className="block text-base font-semibold">{option.label}</span>
            <span className="mt-1 block text-[15px] leading-snug text-neutral-600 dark:text-neutral-400">
              {option.detail}
            </span>
          </button>
        ))}
      </div>

      {index > firstUnanswered ? (
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

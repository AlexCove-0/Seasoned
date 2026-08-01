"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArchetypeExplainer } from "@/components/archetype-explainer";
import { AxesChart } from "@/components/axes-chart";
import { QuizFlow } from "@/components/quiz-flow";
import type { FlavorAxes } from "@/lib/flavor/axes";
import type { QuizResult } from "@/lib/flavor/scoring";
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
  const [result, setResult] = useState<{ axes: FlavorAxes; archetype: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  function handleScored(scored: QuizResult) {
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

  if (result) {
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

        <Link
          href={doneHref}
          className="self-start rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white dark:bg-accent-400"
        >
          Done
        </Link>
      </div>
    );
  }

  return (
    <QuizFlow
      onScored={handleScored}
      busy={saving}
      error={error}
      skip={{ href: doneHref, label: "Skip for now" }}
    />
  );
}

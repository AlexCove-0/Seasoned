"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Recipe } from "@/lib/types";

function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // Audio isn't critical to cooking; fail silently if it's unavailable.
  }
}

function useWakeLock() {
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null;

    async function acquire() {
      try {
        if ("wakeLock" in navigator) {
          sentinel = await navigator.wakeLock.request("screen");
        }
      } catch {
        // Wake lock isn't available on every device/browser; cooking still works without it.
      }
    }

    acquire();

    function onVisibilityChange() {
      // The lock is released automatically when the tab loses visibility.
      if (document.visibilityState === "visible") acquire();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      sentinel?.release().catch(() => {});
    };
  }, []);
}

function StepTimer() {
  const [minutes, setMinutes] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function start() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSecondsLeft(minutes * 60);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          beep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function cancel() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSecondsLeft(null);
  }

  if (secondsLeft !== null) {
    const mm = Math.floor(secondsLeft / 60);
    const ss = secondsLeft % 60;
    return (
      <div className="flex items-center justify-between rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
        <span
          className={
            secondsLeft === 0
              ? "text-3xl font-semibold tabular-nums text-red-600"
              : "text-3xl font-semibold tabular-nums"
          }
        >
          {mm}:{String(ss).padStart(2, "0")}
        </span>
        <button
          onClick={cancel}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600"
        >
          {secondsLeft === 0 ? "Dismiss" : "Cancel"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={1}
        value={minutes}
        onChange={(e) => setMinutes(Math.max(1, Number(e.target.value) || 1))}
        className="w-16 rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
      <span className="text-sm text-neutral-500">min</span>
      <button
        onClick={start}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium dark:border-neutral-700"
      >
        Start timer
      </button>
    </div>
  );
}

export function CookModeClient({ recipe }: { recipe: Recipe }) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = recipe.steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === recipe.steps.length - 1;

  useWakeLock();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <Link href={`/recipes/${recipe.id}`} className="text-sm text-neutral-500 underline">
          &larr; Exit cooking mode
        </Link>
        <span className="text-sm text-neutral-500">
          Step {stepIndex + 1} of {recipe.steps.length}
        </span>
      </div>

      <h1 className="text-lg font-medium text-neutral-500">{recipe.title}</h1>

      <div className="flex flex-1 flex-col justify-center gap-4">
        <p className="text-2xl leading-snug font-medium">{step.instruction}</p>
        {step.technique_note ? (
          <p className="rounded-lg bg-neutral-100 p-4 text-lg text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            {step.technique_note}
          </p>
        ) : null}
        <StepTimer key={stepIndex} />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={isFirst}
          className="flex-1 rounded-md border border-neutral-300 px-4 py-3 text-sm font-medium disabled:opacity-40 dark:border-neutral-700"
        >
          Back
        </button>
        {isLast ? (
          <Link
            href={`/recipes/${recipe.id}`}
            className="flex-1 rounded-md bg-accent-600 px-4 py-3 text-center text-sm font-medium text-white dark:bg-accent-400 dark:text-white"
          >
            Done — log this cook
          </Link>
        ) : (
          <button
            onClick={() => setStepIndex((i) => Math.min(recipe.steps.length - 1, i + 1))}
            className="flex-1 rounded-md bg-accent-600 px-4 py-3 text-sm font-medium text-white dark:bg-accent-400 dark:text-white"
          >
            Next
          </button>
        )}
      </div>
    </main>
  );
}

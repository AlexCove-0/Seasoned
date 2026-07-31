"use client";

import { useState, useTransition } from "react";
import { TagPicker } from "@/components/tag-picker";
import { TastePicker } from "@/components/taste-picker";
import { TASTE_PREFERENCES, COMMON_ALLERGENS } from "@/lib/taste-options";
import { submitTasteQuestionnaire } from "./actions";

const HIGHLIGHTS = [
  "Recipes come from real conversations with an AI chef instructor, not generic search results, and get saved for good instead of lost in a chat.",
  "Every recipe adjusts for who's actually eating, using taste profiles like the one you just filled out.",
  "Rate and log each time you cook something so the household's best dishes rise to the top over time.",
  "A shopping list builds itself from whatever you're cooking next.",
];

export function QuestionnaireForm({
  token,
  displayName,
}: {
  token: string;
  displayName: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (submitted) {
    return (
      <div className="flex flex-col gap-5 rounded-lg border border-accent-600/30 bg-accent-50 p-5 text-sm dark:border-accent-400/30 dark:bg-transparent">
        <p>Thanks, {displayName}! Your taste profile is saved.</p>

        <div className="flex flex-col gap-2">
          <p className="font-medium">Sharpen your skills in the kitchen with Sazón:</p>
          <ul className="flex flex-col gap-1.5 text-neutral-600 dark:text-neutral-400">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex gap-2">
                <span className="text-accent-600 dark:text-accent-400">&bull;</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-1 border-t border-accent-600/20 pt-4 dark:border-accent-400/20">
          <p>
            Sign in at{" "}
            <a href="/" className="font-medium underline">
              seasoned.app
            </a>{" "}
            with this same household to claim your profile and start cooking.
          </p>
          <p className="text-neutral-500">
            On your phone, open it in Safari and use Share &rarr; Add to Home Screen for an app icon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const tastePreferences = formData.getAll("tastePreferences").map(String);
        const dislikedTastes = formData.getAll("dislikedTastes").map(String);
        const allergies = formData.getAll("allergies").map(String);
        startTransition(async () => {
          const result = await submitTasteQuestionnaire(token, tastePreferences, dislikedTastes, allergies);
          if (result.error) setError(result.error);
          else setSubmitted(true);
        });
      }}
      className="flex flex-col gap-4"
    >
      <TastePicker
        likedName="tastePreferences"
        dislikedName="dislikedTastes"
        label="Taste preferences"
        suggestions={TASTE_PREFERENCES}
      />
      <TagPicker name="allergies" label="Food allergies" suggestions={COMMON_ALLERGENS} />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent-400 dark:text-white"
      >
        {pending ? "Saving..." : "Save my preferences"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}

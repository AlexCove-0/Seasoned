"use client";

import { useState, useTransition } from "react";
import { TagPicker } from "@/components/tag-picker";
import { TastePicker } from "@/components/taste-picker";
import { TASTE_PREFERENCES, COMMON_ALLERGENS } from "@/lib/taste-options";
import { submitTasteQuestionnaire } from "./actions";

export function QuestionnaireForm({ token, displayName }: { token: string; displayName: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (submitted) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-accent-600/30 bg-accent-50 p-4 text-sm dark:border-accent-400/30 dark:bg-transparent">
        <p>Thanks, {displayName}! Your taste profile is saved.</p>
        <p className="text-neutral-500">
          Want recipes built around it? Sign in at{" "}
          <a href="/" className="underline">
            seasoned.app
          </a>{" "}
          with the same household to claim your profile and start cooking.
        </p>
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

"use client";

import { useActionState } from "react";
import { TagPicker } from "@/components/tag-picker";
import { TastePicker } from "@/components/taste-picker";
import { TASTE_PREFERENCES, COMMON_ALLERGENS } from "@/lib/taste-options";
import { saveProfile } from "./actions";

const inputClass =
  "rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900";
const buttonClass =
  "rounded-md bg-accent-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent-400 dark:text-white";

export function ProfileSetupForm({
  defaultDisplayName,
  defaultTastePreferences = [],
  defaultDislikedTastes = [],
  defaultAllergies = [],
}: {
  defaultDisplayName: string;
  defaultTastePreferences?: string[];
  defaultDislikedTastes?: string[];
  defaultAllergies?: string[];
}) {
  const [state, formAction, pending] = useActionState(saveProfile, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <label className="flex flex-col gap-1 text-sm">
        Your name
        <input
          name="displayName"
          required
          defaultValue={defaultDisplayName}
          className={inputClass}
        />
      </label>

      <TastePicker
        likedName="tastePreferences"
        dislikedName="dislikedTastes"
        label="Taste preferences"
        suggestions={TASTE_PREFERENCES}
        defaultLiked={defaultTastePreferences}
        defaultDisliked={defaultDislikedTastes}
      />

      <TagPicker
        name="allergies"
        label="Food allergies"
        suggestions={COMMON_ALLERGENS}
        defaultValue={defaultAllergies}
        placeholder="Search allergens or add your own..."
      />

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving..." : "Continue"}
      </button>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
    </form>
  );
}

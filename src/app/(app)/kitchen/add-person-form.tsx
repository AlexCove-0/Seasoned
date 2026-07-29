"use client";

import { useActionState, useEffect, useState } from "react";
import { TagPicker } from "@/components/tag-picker";
import { TastePicker } from "@/components/taste-picker";
import { TASTE_PREFERENCES, COMMON_ALLERGENS } from "@/lib/taste-options";
import { addPerson } from "./profile-actions";

const inputClass =
  "rounded-lg bg-neutral-100 px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-600/30 focus:outline-none dark:bg-neutral-900";
const buttonClass =
  "rounded-md bg-accent-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent-400 dark:text-white";

export function AddPersonForm() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState(addPerson, { error: null });

  useEffect(() => {
    if (submitted && !pending && !state.error) {
      setOpen(false);
      setSubmitted(false);
      setFormKey((k) => k + 1);
    }
  }, [submitted, pending, state.error]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start text-sm text-neutral-500 underline"
      >
        + Add a person
      </button>
    );
  }

  return (
    <form
      key={formKey}
      action={formAction}
      className="flex flex-col gap-4 rounded-xl p-4 ring-1 ring-neutral-200 dark:ring-neutral-800"
    >
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          name="displayName"
          required
          placeholder="e.g. your daughter's name"
          className={inputClass}
        />
      </label>
      <p className="text-xs text-neutral-500">
        For people who cook with you but won&apos;t sign in themselves — no email needed.
      </p>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isFavorite" defaultChecked className="h-4 w-4" />
        Favorite — show by default when picking who you&apos;re cooking for
      </label>
      <TastePicker
        likedName="tastePreferences"
        dislikedName="dislikedTastes"
        label="Taste preferences"
        suggestions={TASTE_PREFERENCES}
      />
      <TagPicker name="allergies" label="Food allergies" suggestions={COMMON_ALLERGENS} />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className={buttonClass}
          onClick={() => setSubmitted(true)}
        >
          {pending ? "Adding..." : "Add person"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-3 py-2 text-sm text-neutral-500"
        >
          Cancel
        </button>
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
    </form>
  );
}

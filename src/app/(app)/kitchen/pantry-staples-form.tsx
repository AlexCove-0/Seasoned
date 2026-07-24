"use client";

import { useActionState } from "react";
import { TagPicker } from "@/components/tag-picker";
import { PANTRY_STAPLES } from "@/lib/taste-options";
import { updatePantryStaples } from "./kitchen-actions";

const buttonClass =
  "self-start rounded-md bg-accent-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent-400 dark:text-white";

export function PantryStaplesForm({ defaultValue }: { defaultValue: string[] }) {
  const [state, formAction, pending] = useActionState(updatePantryStaples, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <TagPicker
        name="pantryStaples"
        label="Pantry staples"
        suggestions={PANTRY_STAPLES}
        defaultValue={defaultValue}
        placeholder="What do you always have on hand?"
      />
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving..." : "Save"}
      </button>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
    </form>
  );
}

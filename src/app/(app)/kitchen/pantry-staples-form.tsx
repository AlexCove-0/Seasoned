"use client";

import { useActionState } from "react";
import { CollapsibleRow } from "@/components/collapsible-row";
import { TagPicker } from "@/components/tag-picker";
import { PANTRY_STAPLES } from "@/lib/taste-options";
import { updatePantryStaples } from "./kitchen-actions";

export function PantryStaplesForm({ defaultValue }: { defaultValue: string[] }) {
  const [state, formAction, pending] = useActionState(updatePantryStaples, { error: null });

  return (
    <CollapsibleRow
      label="Pantry staples"
      summary={defaultValue.length > 0 ? `${defaultValue.length} set` : "None yet"}
    >
      <form action={formAction} className="flex flex-col gap-3">
        <TagPicker
          name="pantryStaples"
          suggestions={PANTRY_STAPLES}
          defaultValue={defaultValue}
          placeholder="What do you always have on hand?"
        />
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-accent-400"
        >
          {pending ? "Saving..." : "Save"}
        </button>
        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      </form>
    </CollapsibleRow>
  );
}

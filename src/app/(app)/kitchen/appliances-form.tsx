"use client";

import { useActionState } from "react";
import { TagPicker } from "@/components/tag-picker";
import { APPLIANCES } from "@/lib/taste-options";
import { updateAppliances } from "./kitchen-actions";

const buttonClass =
  "self-start rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900";

export function AppliancesForm({ defaultValue }: { defaultValue: string[] }) {
  const [state, formAction, pending] = useActionState(updateAppliances, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <TagPicker
        name="appliances"
        label="Appliances"
        suggestions={APPLIANCES}
        defaultValue={defaultValue}
        placeholder="e.g. Instant Pot, wok..."
      />
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving..." : "Save"}
      </button>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { CollapsibleRow } from "@/components/collapsible-row";
import { TagPicker } from "@/components/tag-picker";
import { APPLIANCES } from "@/lib/taste-options";
import { updateAppliances } from "./kitchen-actions";

export function AppliancesForm({ defaultValue }: { defaultValue: string[] }) {
  const [state, formAction, pending] = useActionState(updateAppliances, { error: null });

  return (
    <CollapsibleRow
      label="Appliances"
      summary={defaultValue.length > 0 ? `${defaultValue.length} set` : "None yet"}
    >
      <form action={formAction} className="flex flex-col gap-3">
        <TagPicker
          name="appliances"
          suggestions={APPLIANCES}
          defaultValue={defaultValue}
          placeholder="e.g. Instant Pot, wok..."
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

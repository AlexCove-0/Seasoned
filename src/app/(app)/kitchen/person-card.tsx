"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { TagPicker } from "@/components/tag-picker";
import { TASTE_PREFERENCES, COMMON_ALLERGENS, REGIONAL_CUISINES } from "@/lib/taste-options";
import { updatePerson, toggleFavorite } from "./profile-actions";
import type { Member } from "./page";

const inputClass =
  "rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900";
const buttonClass =
  "rounded-md bg-accent-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent-400 dark:text-white";

function ChipRow({ tags }: { tags: string[] }) {
  if (tags.length === 0) return <span className="text-neutral-400">None set</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span
          key={t}
          className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-800"
        >
          {t}
        </span>
      ))}
    </span>
  );
}

export function PersonCard({ member }: { member: Member }) {
  const [editing, setEditing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [state, formAction, pending] = useActionState(updatePerson, { error: null });
  const [favoritePending, startFavoriteTransition] = useTransition();

  useEffect(() => {
    if (submitted && !pending && !state.error) setEditing(false);
  }, [submitted, pending, state.error]);

  if (!editing) {
    return (
      <div className="rounded-lg border border-neutral-200 p-4 text-sm dark:border-neutral-800">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <button
              type="button"
              disabled={favoritePending}
              onClick={() =>
                startFavoriteTransition(() => toggleFavorite(member.id, !member.is_favorite))
              }
              aria-label={member.is_favorite ? "Remove from favorites" : "Add to favorites"}
              className="text-base leading-none text-amber-500 disabled:opacity-50"
            >
              {member.is_favorite ? "★" : "☆"}
            </button>
            {member.display_name}
            {!member.user_id ? (
              <span className="text-xs font-normal text-neutral-400">no login</span>
            ) : null}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-neutral-500 underline"
          >
            Edit
          </button>
        </div>
        <dl className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-neutral-500">Tastes</dt>
            <dd>
              <ChipRow tags={member.taste_preferences} />
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-neutral-500">Regional</dt>
            <dd>
              <ChipRow tags={member.regional_tastes} />
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-neutral-500">Allergies</dt>
            <dd>
              <ChipRow tags={member.allergies} />
            </dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-lg border border-neutral-300 p-4 dark:border-neutral-700"
    >
      <input type="hidden" name="memberId" value={member.id} />
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input name="displayName" required defaultValue={member.display_name} className={inputClass} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isFavorite" defaultChecked={member.is_favorite} className="h-4 w-4" />
        Favorite — show by default when picking who you&apos;re cooking for
      </label>
      <TagPicker
        name="tastePreferences"
        label="Taste preferences"
        suggestions={TASTE_PREFERENCES}
        defaultValue={member.taste_preferences}
      />
      <TagPicker
        name="regionalTastes"
        label="Regional tastes"
        suggestions={REGIONAL_CUISINES}
        defaultValue={member.regional_tastes}
      />
      <TagPicker
        name="allergies"
        label="Food allergies"
        suggestions={COMMON_ALLERGENS}
        defaultValue={member.allergies}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className={buttonClass}
          onClick={() => setSubmitted(true)}
        >
          {pending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-md px-3 py-2 text-sm text-neutral-500"
        >
          Cancel
        </button>
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
    </form>
  );
}

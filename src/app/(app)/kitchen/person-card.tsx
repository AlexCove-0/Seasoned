"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, useTransition } from "react";
import { TagPicker } from "@/components/tag-picker";
import { TastePicker } from "@/components/taste-picker";
import { TASTE_PREFERENCES, COMMON_ALLERGENS } from "@/lib/taste-options";
import { monthsSince, STALE_AFTER_MONTHS } from "@/lib/flavor/scoring";
import { updatePerson, toggleFavorite } from "./profile-actions";
import type { Member } from "./page";

const inputClass =
  "rounded-lg bg-neutral-100 px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-600/30 focus:outline-none dark:bg-neutral-900";
const buttonClass =
  "rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-accent-400";

type ChipColor = "green" | "red" | "yellow";

const chipColorClass: Record<ChipColor, string> = {
  green: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  red: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
};

function FlavorQuizRow({
  memberId,
  hasProfile,
  takenAt,
}: {
  memberId: string;
  hasProfile: boolean;
  takenAt: string | null;
}) {
  const age = monthsSince(takenAt);
  const stale = age !== null && age >= STALE_AFTER_MONTHS;
  const href = `/quiz?member=${memberId}&next=/kitchen`;

  if (!hasProfile) {
    return (
      <Link
        href={href}
        className="mb-2 block rounded-lg bg-accent-50 px-3 py-2 text-xs text-accent-600 dark:bg-accent-950 dark:text-accent-400"
      >
        Take the flavor quiz &rarr;{" "}
        <span className="text-neutral-500">2 minutes, sharpens every recipe</span>
      </Link>
    );
  }

  return (
    <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
      <span>
        Flavor profile
        {age !== null ? ` · ${age < 1 ? "just taken" : `${age} mo ago`}` : ""}
      </span>
      <Link href={href} className="underline underline-offset-2 hover:text-neutral-900 dark:hover:text-white">
        {stale ? "Tastes changed? Retake" : "Retake"}
      </Link>
    </div>
  );
}

function ChipRow({ tags, color }: { tags: string[]; color: ChipColor }) {
  if (tags.length === 0) return <span className="text-neutral-400">None set</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span key={t} className={`rounded-full px-2 py-0.5 text-xs ${chipColorClass[color]}`}>
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
  const [inviteCopied, setInviteCopied] = useState(false);

  useEffect(() => {
    if (submitted && !pending && !state.error) setEditing(false);
  }, [submitted, pending, state.error]);

  async function sendInvite() {
    const url = `${window.location.origin}/invite/${member.invite_token}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Taste profile for Sazón",
          text: `Hey ${member.display_name}, fill out your taste profile so recipes actually turn out how you like them:`,
          url,
        });
        return;
      } catch {
        return; // share sheet dismissed -- nothing to do
      }
    }
    await navigator.clipboard.writeText(url);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  }

  if (!editing) {
    return (
      <div className="rounded-xl bg-neutral-100 p-4 text-sm dark:bg-neutral-900">
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
            {member.flavor_archetype ? (
              <span className="rounded-full bg-accent-50 px-2 py-0.5 text-xs font-normal text-accent-600 dark:bg-accent-950 dark:text-accent-400">
                {member.flavor_archetype}
              </span>
            ) : null}
          </span>
          <div className="flex items-center gap-3">
            {!member.user_id ? (
              <button
                type="button"
                onClick={sendInvite}
                className="rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs text-neutral-600 hover:bg-accent-600 hover:text-white dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-accent-400"
              >
                {inviteCopied ? "Link copied!" : "Send Invite"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs text-neutral-500 underline hover:text-neutral-900 dark:hover:text-white"
            >
              Edit
            </button>
          </div>
        </div>
        <FlavorQuizRow
          memberId={member.id}
          hasProfile={Boolean(member.flavor_archetype)}
          takenAt={member.quiz_taken_at}
        />
        <dl className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-neutral-500">Likes</dt>
            <dd>
              <ChipRow tags={member.taste_preferences} color="green" />
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-neutral-500">Dislikes</dt>
            <dd>
              <ChipRow tags={member.disliked_tastes} color="red" />
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-neutral-500">Allergies</dt>
            <dd>
              <ChipRow tags={member.allergies} color="yellow" />
            </dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-xl p-4 ring-1 ring-neutral-200 dark:ring-neutral-800"
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
      <TastePicker
        likedName="tastePreferences"
        dislikedName="dislikedTastes"
        label="Taste preferences"
        suggestions={TASTE_PREFERENCES}
        defaultLiked={member.taste_preferences}
        defaultDisliked={member.disliked_tastes}
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

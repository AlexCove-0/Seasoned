"use client";

import { useState, useTransition } from "react";
import { StarRating, StarDisplay } from "@/components/star-rating";
import { submitRating } from "./actions";
import type { RecipeRating } from "@/lib/types";

type Member = { id: string; display_name: string };
type GuestRating = { id: string; guest_name: string; rating: number; comment: string | null };

export function RecipeRatings({
  recipeId,
  members,
  ratings,
  guestRatings,
}: {
  recipeId: string;
  members: Member[];
  ratings: RecipeRating[];
  guestRatings: GuestRating[];
}) {
  const byMember = new Map(ratings.map((r) => [r.member_id, r]));
  const allRatingValues = [...ratings.map((r) => r.rating), ...guestRatings.map((r) => r.rating)];
  const overall =
    allRatingValues.length > 0
      ? allRatingValues.reduce((sum, r) => sum + r, 0) / allRatingValues.length
      : 0;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Ratings</h2>
        {allRatingValues.length > 0 ? (
          <div className="flex items-center gap-2">
            <StarDisplay value={overall} />
            <span className="text-sm text-neutral-500">
              {overall.toFixed(1)} ({allRatingValues.length}{" "}
              {allRatingValues.length === 1 ? "rating" : "ratings"})
            </span>
          </div>
        ) : (
          <span className="text-sm text-neutral-500">No ratings yet</span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {members.map((m) => (
          <MemberRatingRow
            key={m.id}
            recipeId={recipeId}
            member={m}
            existing={byMember.get(m.id) ?? null}
          />
        ))}
      </div>

      {guestRatings.length > 0 ? (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
            From shared links
          </span>
          {guestRatings.map((g) => (
            <div
              key={g.id}
              className="flex flex-col gap-1 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{g.guest_name}</span>
                <StarDisplay value={g.rating} />
              </div>
              {g.comment ? <p className="text-sm text-neutral-500">{g.comment}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function MemberRatingRow({
  recipeId,
  member,
  existing,
}: {
  recipeId: string;
  member: Member;
  existing: RecipeRating | null;
}) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await submitRating(recipeId, member.id, rating, comment);
      setDirty(false);
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{member.display_name}</span>
        <StarRating
          value={rating}
          onChange={(v) => {
            setRating(v);
            setDirty(true);
          }}
        />
      </div>
      <textarea
        value={comment}
        onChange={(e) => {
          setComment(e.target.value);
          setDirty(true);
        }}
        placeholder="Any notes on how it was?"
        rows={2}
        className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
      {dirty ? (
        <button
          type="button"
          onClick={save}
          disabled={pending || rating === 0}
          className="self-start rounded-md bg-accent-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 dark:bg-accent-400 dark:text-white"
        >
          {pending ? "Saving..." : "Save rating"}
        </button>
      ) : null}
    </div>
  );
}

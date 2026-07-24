"use client";

import { useState, useTransition } from "react";
import { StarRating } from "@/components/star-rating";
import { submitGuestRating } from "./actions";

export function GuestRatingForm({ token }: { token: string }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (submitted) {
    return (
      <p className="rounded-md border border-accent-600/30 bg-accent-50 p-3 text-sm dark:border-accent-400/30 dark:bg-transparent">
        Thanks, {name}! Your rating&apos;s in.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim() || rating === 0) {
          setError("Add your name and a rating first.");
          return;
        }
        startTransition(async () => {
          const result = await submitGuestRating(token, name.trim(), rating, comment.trim());
          if (result.error) setError(result.error);
          else setSubmitted(true);
        });
      }}
      className="flex flex-col gap-3"
    >
      <label className="flex flex-col gap-1 text-sm">
        Your name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Grandma Rosa"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Your rating</span>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What did you think?"
        rows={3}
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent-400 dark:text-white"
      >
        {pending ? "Sending..." : "Submit rating"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}

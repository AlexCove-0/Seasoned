"use client";

import { useTransition } from "react";
import { toggleConnectedFavorite } from "./dining-actions";
import type { ConnectedProfile } from "./page";

type ChipColor = "green" | "red" | "yellow";

const chipColorClass: Record<ChipColor, string> = {
  green: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  red: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
};

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

export function ConnectedProfileCard({ profile }: { profile: ConnectedProfile }) {
  const [favoritePending, startFavoriteTransition] = useTransition();

  return (
    <div className="rounded-xl bg-neutral-100 p-4 text-sm dark:bg-neutral-900">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          <button
            type="button"
            disabled={favoritePending}
            onClick={() =>
              startFavoriteTransition(() =>
                toggleConnectedFavorite(profile.user_id, !profile.is_favorite),
              )
            }
            aria-label={profile.is_favorite ? "Remove from favorites" : "Add to favorites"}
            className="text-base leading-none text-amber-500 disabled:opacity-50"
          >
            {profile.is_favorite ? "★" : "☆"}
          </button>
          {profile.display_name}
        </span>
        <span className="text-xs text-neutral-400">Shared profile — they manage their tastes</span>
      </div>
      <dl className="flex flex-col gap-1.5">
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 text-neutral-500">Likes</dt>
          <dd>
            <ChipRow tags={profile.taste_preferences} color="green" />
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 text-neutral-500">Dislikes</dt>
          <dd>
            <ChipRow tags={profile.disliked_tastes} color="red" />
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 text-neutral-500">Allergies</dt>
          <dd>
            <ChipRow tags={profile.allergies} color="yellow" />
          </dd>
        </div>
      </dl>
    </div>
  );
}

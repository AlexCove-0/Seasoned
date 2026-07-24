"use client";

import { useState } from "react";
import { PersonCard } from "./person-card";
import { AddPersonForm } from "./add-person-form";
import type { Member } from "./page";

export function ProfilesSection({ members }: { members: Member[] }) {
  const [showAll, setShowAll] = useState(false);

  const favorites = members.filter((m) => m.is_favorite);
  const rest = members.filter((m) => !m.is_favorite);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Profiles</h2>
        <p className="text-xs text-neutral-500">
          Favorites show up by default when picking who you&apos;re cooking for.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {favorites.map((m) => (
          <PersonCard key={m.id} member={m} />
        ))}
      </div>

      {rest.length > 0 ? (
        <div className="flex flex-col gap-3">
          {showAll ? (
            rest.map((m) => <PersonCard key={m.id} member={m} />)
          ) : (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="self-start rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-500 hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:hover:text-white"
            >
              + {rest.length} more {rest.length === 1 ? "profile" : "profiles"}
            </button>
          )}
        </div>
      ) : null}

      <AddPersonForm />
    </section>
  );
}

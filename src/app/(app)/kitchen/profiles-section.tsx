"use client";

import { useState } from "react";
import { PersonCard } from "./person-card";
import { ConnectedProfileCard } from "./connected-profile-card";
import { AddPersonForm } from "./add-person-form";
import type { ConnectedProfile, Member } from "./page";

export function ProfilesSection({
  members,
  connected,
}: {
  members: Member[];
  connected: ConnectedProfile[];
}) {
  const [showAll, setShowAll] = useState(false);

  const favorites = members.filter((m) => m.is_favorite);
  const rest = members.filter((m) => !m.is_favorite);
  const connectedFavorites = connected.filter((c) => c.is_favorite);
  const connectedRest = connected.filter((c) => !c.is_favorite);
  const hiddenCount = rest.length + connectedRest.length;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">My Dining Room</h2>
        <p className="text-xs text-neutral-500">
          Everyone you might cook for. Favorites show up by default.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {favorites.map((m) => (
          <PersonCard key={m.id} member={m} />
        ))}
        {connectedFavorites.map((c) => (
          <ConnectedProfileCard key={c.user_id} profile={c} />
        ))}
      </div>

      {hiddenCount > 0 ? (
        <div className="flex flex-col gap-3">
          {showAll ? (
            <>
              {rest.map((m) => (
                <PersonCard key={m.id} member={m} />
              ))}
              {connectedRest.map((c) => (
                <ConnectedProfileCard key={c.user_id} profile={c} />
              ))}
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="self-start rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-500 hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:hover:text-white"
            >
              + {hiddenCount} more {hiddenCount === 1 ? "profile" : "profiles"}
            </button>
          )}
        </div>
      ) : null}

      <AddPersonForm />
    </section>
  );
}

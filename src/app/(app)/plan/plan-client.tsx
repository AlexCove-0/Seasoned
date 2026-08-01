"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { photoUrl } from "@/lib/photos";
import { dayLabel, shortDate, type IsoDate } from "@/lib/week";
import { addPlanToShoppingList, planMeal, unplanMeal } from "./actions";

export type PlanEntry = {
  id: string;
  planned_for: string;
  note: string | null;
  recipe_id: string | null;
  recipe_title: string | null;
  recipe_image: string | null;
};

export type RecipeOption = { id: string; title: string };

export function PlanClient({
  days,
  entries,
  recipes,
}: {
  days: IsoDate[];
  entries: PlanEntry[];
  recipes: RecipeOption[];
}) {
  const [openDay, setOpenDay] = useState<IsoDate | null>(null);
  const [shopping, startShopping] = useTransition();
  const [shopMessage, setShopMessage] = useState<string | null>(null);

  const plannedCount = entries.length;

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {days.map((day) => {
          const dayEntries = entries.filter((e) => e.planned_for === day);
          return (
            <li key={day} className="rounded-xl bg-neutral-100 p-3.5 dark:bg-neutral-900">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold">{dayLabel(day)}</span>
                <span className="text-xs text-neutral-500">{shortDate(day)}</span>
              </div>

              {dayEntries.length > 0 ? (
                <ul className="mt-2 flex flex-col gap-1.5">
                  {dayEntries.map((entry) => (
                    <EntryRow key={entry.id} entry={entry} />
                  ))}
                </ul>
              ) : null}

              {openDay === day ? (
                <AddForm
                  day={day}
                  recipes={recipes}
                  onDone={() => setOpenDay(null)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setOpenDay(day)}
                  className="mt-2 text-xs text-neutral-500 underline underline-offset-2"
                >
                  + Plan something
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-2 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-900">
        <p className="text-sm font-medium">Shop for the week</p>
        <p className="text-sm text-neutral-500">
          Adds every ingredient from this week&apos;s planned recipes, minus your pantry staples,
          and skips anything already on the list.
        </p>
        <button
          type="button"
          disabled={shopping || plannedCount === 0}
          onClick={() =>
            startShopping(async () => {
              setShopMessage(null);
              const res = await addPlanToShoppingList(days[0], days[days.length - 1]);
              setShopMessage(
                res.error ?? `Added ${res.added} item${res.added === 1 ? "" : "s"} to the list.`,
              );
            })
          }
          className="self-start rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-accent-400"
        >
          {shopping ? "Adding..." : "Add this week to shopping list"}
        </button>
        {shopMessage ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {shopMessage}{" "}
            <Link href="/shopping-list" className="underline underline-offset-2">
              Open list
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}

function EntryRow({ entry }: { entry: PlanEntry }) {
  const [pending, startTransition] = useTransition();

  const body = (
    <>
      {entry.recipe_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl(entry.recipe_image)}
          alt=""
          className="h-9 w-9 shrink-0 rounded-md object-cover"
          loading="lazy"
        />
      ) : null}
      <span className="flex-1 text-sm">{entry.recipe_title ?? entry.note}</span>
    </>
  );

  return (
    <li className="flex items-center gap-2.5 rounded-lg bg-neutral-50 px-2.5 py-2 dark:bg-neutral-950">
      {entry.recipe_id ? (
        <Link href={`/recipes/${entry.recipe_id}`} className="flex flex-1 items-center gap-2.5">
          {body}
        </Link>
      ) : (
        <span className="flex flex-1 items-center gap-2.5 text-neutral-600 dark:text-neutral-400">
          {body}
        </span>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => unplanMeal(entry.id))}
        aria-label="Remove from plan"
        className="px-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-50 dark:hover:text-white"
      >
        &times;
      </button>
    </li>
  );
}

function AddForm({
  day,
  recipes,
  onDone,
}: {
  day: IsoDate;
  recipes: RecipeOption[];
  onDone: () => void;
}) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const q = query.trim().toLowerCase();
  const matches = q
    ? recipes.filter((r) => r.title.toLowerCase().includes(q)).slice(0, 5)
    : recipes.slice(0, 5);

  function add(recipeId: string | null, note: string) {
    startTransition(async () => {
      const res = await planMeal(day, recipeId, note);
      if (res.error) setError(res.error);
      else {
        setQuery("");
        onDone();
      }
    });
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search recipes, or type anything (leftovers, takeout...)"
        className="rounded-lg bg-neutral-50 px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-600/30 focus:outline-none dark:bg-neutral-950"
      />

      {matches.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {matches.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                disabled={pending}
                onClick={() => add(r.id, "")}
                className="w-full rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent-50 disabled:opacity-50 dark:hover:bg-neutral-800"
              >
                {r.title}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-center gap-3">
        {q ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => add(null, query)}
            className="text-xs font-medium text-accent-600 underline underline-offset-2 disabled:opacity-50 dark:text-accent-400"
          >
            Add &ldquo;{query.trim()}&rdquo; as a plain note
          </button>
        ) : null}
        <button
          type="button"
          onClick={onDone}
          className="ml-auto text-xs text-neutral-500 underline underline-offset-2"
        >
          Cancel
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

"use client";

import { useActionState, useState } from "react";
import { createHousehold, joinHousehold } from "./actions";

const inputClass =
  "rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900";
const buttonClass =
  "rounded-md bg-accent-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent-400 dark:text-white";

export function HouseholdSetupForms() {
  const [mode, setMode] = useState<"create" | "join">("create");

  const [createState, createAction, createPending] = useActionState(
    createHousehold,
    { error: null },
  );
  const [joinState, joinAction, joinPending] = useActionState(joinHousehold, {
    error: null,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 text-sm">
        <button
          className={mode === "create" ? "font-semibold underline" : "text-neutral-500"}
          onClick={() => setMode("create")}
          type="button"
        >
          Create new
        </button>
        <span className="text-neutral-400">/</span>
        <button
          className={mode === "join" ? "font-semibold underline" : "text-neutral-500"}
          onClick={() => setMode("join")}
          type="button"
        >
          Join existing
        </button>
      </div>

      {mode === "create" ? (
        <form action={createAction} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Household name
            <input
              name="householdName"
              required
              placeholder="The Calvarado Kitchen"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Your name
            <input name="displayName" required placeholder="Alex" className={inputClass} />
          </label>
          <button type="submit" disabled={createPending} className={buttonClass}>
            {createPending ? "Creating..." : "Create household"}
          </button>
          {createState.error ? (
            <p className="text-sm text-red-600">{createState.error}</p>
          ) : null}
        </form>
      ) : (
        <form action={joinAction} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Invite code
            <input
              name="inviteCode"
              required
              placeholder="ABC123"
              className={`${inputClass} uppercase`}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Your name
            <input name="displayName" required placeholder="Alex" className={inputClass} />
          </label>
          <button type="submit" disabled={joinPending} className={buttonClass}>
            {joinPending ? "Joining..." : "Join household"}
          </button>
          {joinState.error ? (
            <p className="text-sm text-red-600">{joinState.error}</p>
          ) : null}
        </form>
      )}
    </div>
  );
}

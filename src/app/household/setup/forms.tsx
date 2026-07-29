"use client";

import { useActionState, useState, useTransition } from "react";
import { TagPicker } from "@/components/tag-picker";
import { TastePicker } from "@/components/taste-picker";
import { TASTE_PREFERENCES, COMMON_ALLERGENS } from "@/lib/taste-options";
import {
  createHousehold,
  createProfileAndConnect,
  joinHousehold,
  lookupUnclaimedProfiles,
  claimProfile,
} from "./actions";
import type { UnclaimedProfile } from "./actions";

const inputClass =
  "rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900";
const buttonClass =
  "rounded-md bg-accent-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent-400 dark:text-white";

/**
 * The flow behind an invite link: create YOUR profile first (it gets
 * shared with the inviter's household and theirs with you), then decide
 * where your own recipes live -- a new kitchen, or theirs if you
 * actually share one.
 */
export function InviteAcceptFlow({ code }: { code: string }) {
  const [state, formAction, pending] = useActionState(createProfileAndConnect, { error: null });
  const [kitchenChoice, setKitchenChoice] = useState<"own" | "theirs" | null>(null);

  if (!state.connected) {
    return (
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="inviteCode" value={code} />
        <label className="flex flex-col gap-1 text-sm">
          Your name
          <input name="displayName" required placeholder="Your name" className={inputClass} />
        </label>
        <TastePicker
          likedName="tastePreferences"
          dislikedName="dislikedTastes"
          label="Taste preferences"
          suggestions={TASTE_PREFERENCES}
        />
        <TagPicker name="allergies" label="Food allergies" suggestions={COMMON_ALLERGENS} />
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Saving..." : "Save my profile"}
        </button>
        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-md border border-green-600/30 bg-green-600/10 p-3 text-sm">
        You&apos;re connected! Your taste profile is now in their dining room, and theirs is in
        yours. One last thing — where should your own recipes live?
      </p>

      {kitchenChoice === null ? (
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => setKitchenChoice("own")} className={buttonClass}>
            Set up my own kitchen
          </button>
          <button
            type="button"
            onClick={() => setKitchenChoice("theirs")}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium dark:border-neutral-700"
          >
            I live with them — join their kitchen
          </button>
        </div>
      ) : kitchenChoice === "own" ? (
        <CreateHouseholdForm />
      ) : (
        <JoinHouseholdForm defaultCode={code} />
      )}
    </div>
  );
}

function CreateHouseholdForm() {
  const [createState, createAction, createPending] = useActionState(createHousehold, {
    error: null,
  });

  return (
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
      {createState.error ? <p className="text-sm text-red-600">{createState.error}</p> : null}
    </form>
  );
}

export function HouseholdSetupForms({ defaultCode }: { defaultCode: string | null }) {
  const [mode, setMode] = useState<"create" | "join">(defaultCode ? "join" : "create");

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

      {mode === "create" ? <CreateHouseholdForm /> : <JoinHouseholdForm defaultCode={defaultCode} />}
    </div>
  );
}

function JoinHouseholdForm({ defaultCode }: { defaultCode: string | null }) {
  const [inviteCode, setInviteCode] = useState(defaultCode ?? "");
  const [checked, setChecked] = useState(false);
  const [profiles, setProfiles] = useState<UnclaimedProfile[]>([]);
  const [claimingAsNew, setClaimingAsNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [joinState, joinAction, joinPending] = useActionState(joinHousehold, { error: null });

  function handleCheck() {
    if (!inviteCode.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await lookupUnclaimedProfiles(inviteCode);
      if (result.error) {
        setError(result.error);
        return;
      }
      setProfiles(result.profiles);
      setChecked(true);
    });
  }

  function handleClaim(memberId: string) {
    setError(null);
    startTransition(async () => {
      const result = await claimProfile(inviteCode, memberId);
      if (result?.error) setError(result.error);
    });
  }

  if (!checked) {
    return (
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Invite code
          <input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            required
            placeholder="ABC123"
            className={`${inputClass} uppercase`}
          />
        </label>
        <button
          type="button"
          onClick={handleCheck}
          disabled={pending}
          className={`self-start ${buttonClass}`}
        >
          {pending ? "Checking..." : "Continue"}
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }

  if (profiles.length > 0 && !claimingAsNew) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-neutral-500">
          Are you one of these? Claiming a profile keeps whatever preferences were already
          set for you — you can adjust them next.
        </p>
        {profiles.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleClaim(p.id)}
            disabled={pending}
            className="rounded-md border border-neutral-300 px-3 py-2 text-left text-sm disabled:opacity-50 dark:border-neutral-700"
          >
            I&apos;m {p.display_name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setClaimingAsNew(true)}
          className="text-sm text-neutral-500 underline"
        >
          None of these — I&apos;m someone new
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <form action={joinAction} className="flex flex-col gap-3">
      <input type="hidden" name="inviteCode" value={inviteCode} />
      <label className="flex flex-col gap-1 text-sm">
        Your name
        <input name="displayName" required placeholder="Alex" className={inputClass} />
      </label>
      <button type="submit" disabled={joinPending} className={buttonClass}>
        {joinPending ? "Joining..." : "Join household"}
      </button>
      {joinState.error ? <p className="text-sm text-red-600">{joinState.error}</p> : null}
    </form>
  );
}

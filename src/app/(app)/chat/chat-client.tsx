"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import type { RecipeDraft, RecipeOption } from "@/lib/ai/tools";
import { saveRecipe, bumpIngredientsUsage } from "./actions";
import { SessionSetup, type SessionConfig } from "./session-setup";
import { ExtraIngredientsStep } from "./extra-ingredients-step";
import { RecipeOptionsStep } from "./recipe-options-step";

type ChatMessage = { role: "user" | "assistant"; content: string };
type Member = { id: string; display_name: string; is_favorite: boolean };
type Phase = "setup" | "extra-ingredients" | "options" | "chat";

export function ChatClient({
  members,
  topIngredients,
}: {
  members: Member[];
  topIngredients: string[];
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("setup");
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [starting, setStarting] = useState(false);

  const [extraSuggestions, setExtraSuggestions] = useState<string[]>([]);
  const [confirmedExtras, setConfirmedExtras] = useState<string[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [options, setOptions] = useState<RecipeOption[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [recipe, setRecipe] = useState<RecipeDraft | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  function brainstormBody(cfg: SessionConfig, extraIngredients: string[] = []) {
    return {
      dinerIds: cfg.dinerIds,
      servings: cfg.servings,
      regionalTwist: cfg.regionalTwist,
      ingredientsOnHand: [...cfg.ingredientsOnHand, ...extraIngredients],
    };
  }

  async function handleStart(newConfig: SessionConfig) {
    setConfig(newConfig);
    if (newConfig.ingredientsOnHand.length > 0) {
      void bumpIngredientsUsage(newConfig.ingredientsOnHand);
    }

    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/chat/brainstorm-ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brainstormBody(newConfig)),
      });
      const data = (await res.json()) as { extraIngredients: string[] };
      setExtraSuggestions(data.extraIngredients ?? []);
      setPhase("extra-ingredients");
    } catch {
      setError("Couldn't get suggestions -- try again.");
    } finally {
      setStarting(false);
    }
  }

  async function fetchOptions(cfg: SessionConfig, extras: string[]) {
    setOptionsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat/brainstorm-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brainstormBody(cfg, extras)),
      });
      const data = (await res.json()) as { options: RecipeOption[] };
      setOptions(data.options ?? []);
    } catch {
      setError("Couldn't get recipe ideas -- try again.");
    } finally {
      setOptionsLoading(false);
    }
  }

  async function handleConfirmExtras(confirmed: string[]) {
    if (!config) return;
    setConfirmedExtras(confirmed);
    setPhase("options");
    await fetchOptions(config, confirmed);
  }

  function handleRegionalTwistChange(twist: string[]) {
    if (!config) return;
    const nextConfig = { ...config, regionalTwist: twist };
    setConfig(nextConfig);
    void fetchOptions(nextConfig, confirmedExtras);
  }

  async function sendToApi(nextMessages: ChatMessage[]) {
    if (!config) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          dinerIds: config.dinerIds,
          servings: config.servings,
          regionalTwist: config.regionalTwist,
          ingredientsOnHand: [...config.ingredientsOnHand, ...confirmedExtras],
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong.");
      }
      const data = (await res.json()) as { reply: string; recipe: RecipeDraft | null };

      const assistantText =
        data.reply || (data.recipe ? `Here's the recipe: ${data.recipe.title}` : "");
      setMessages([...nextMessages, { role: "assistant", content: assistantText }]);
      if (data.recipe) setRecipe(data.recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  }

  function handleSelectOption(option: RecipeOption) {
    const seed: ChatMessage = {
      role: "user",
      content: `Let's make "${option.title}" — ${option.pitch} Please give me the full recipe.`,
    };
    setMessages([seed]);
    setPhase("chat");
    void sendToApi([seed]);
  }

  async function send() {
    const text = input.trim();
    if (!text || sending || !config) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setRecipe(null);
    await sendToApi(nextMessages);
  }

  function handleSave() {
    if (!recipe) return;
    startSaving(async () => {
      const id = await saveRecipe(recipe, [...messages]);
      router.push(`/recipes/${id}`);
    });
  }

  if (phase === "setup") {
    return (
      <SessionSetup
        members={members}
        topIngredients={topIngredients}
        onStart={handleStart}
        starting={starting}
      />
    );
  }

  if (phase === "extra-ingredients") {
    return (
      <ExtraIngredientsStep
        suggestions={extraSuggestions}
        onContinue={handleConfirmExtras}
        loading={optionsLoading}
      />
    );
  }

  if (phase === "options") {
    return (
      <RecipeOptionsStep
        options={options}
        regionalTwist={config?.regionalTwist ?? []}
        onRegionalTwistChange={handleRegionalTwistChange}
        onRefresh={() => config && fetchOptions(config, confirmedExtras)}
        onSelect={handleSelectOption}
        loading={optionsLoading}
      />
    );
  }

  // phase === "chat"
  const dinerNames = members
    .filter((m) => config?.dinerIds.includes(m.id))
    .map((m) => m.display_name);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-neutral-200 pb-4 text-xs text-neutral-500 dark:border-neutral-800">
        <span>{dinerNames.length > 0 ? dinerNames.join(", ") : "No one selected"}</span>
        <span>&middot;</span>
        <span>{config?.servings} serving(s)</span>
        {config && config.regionalTwist.length > 0 ? (
          <>
            <span>&middot;</span>
            <span>{config.regionalTwist.join(", ")} twist</span>
          </>
        ) : null}
        <button
          type="button"
          onClick={() => setPhase("setup")}
          className="ml-auto underline hover:text-neutral-900 dark:hover:text-white"
        >
          Start over
        </button>
      </div>

      <div ref={listRef} className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "self-end rounded-2xl bg-accent-600 px-4 py-2 text-sm text-white dark:bg-accent-400 dark:text-white"
                : "self-start whitespace-pre-wrap rounded-2xl bg-neutral-100 px-4 py-2 text-sm dark:bg-neutral-800"
            }
          >
            {m.content}
          </div>
        ))}
        {sending ? <p className="text-sm text-neutral-400">Thinking...</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>

      {recipe ? (
        <div className="rounded-lg border border-neutral-300 p-4 dark:border-neutral-700">
          <h3 className="font-medium">{recipe.title}</h3>
          <p className="mb-3 text-sm text-neutral-500">
            Serves {recipe.base_servings} &middot; {recipe.ingredients.length} ingredients &middot;{" "}
            {recipe.steps.length} steps
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-accent-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent-400 dark:text-white"
          >
            {saving ? "Saving..." : "Save this recipe"}
          </button>
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for a tweak, or say more about what you want..."
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent-400 dark:text-white"
        >
          Send
        </button>
      </form>
    </div>
  );
}

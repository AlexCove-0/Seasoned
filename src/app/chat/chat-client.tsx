"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import type { RecipeDraft } from "@/lib/ai/tools";
import { saveRecipe } from "./actions";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function ChatClient() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [recipe, setRecipe] = useState<RecipeDraft | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setRecipe(null);
    setError(null);
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
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

  function handleSave() {
    if (!recipe) return;
    startSaving(async () => {
      const id = await saveRecipe(recipe, [...messages]);
      router.push(`/recipes/${id}`);
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div ref={listRef} className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4">
        {messages.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Tell me what you&apos;ve got on hand, or what you&apos;re craving, and I&apos;ll help
            you build it out.
          </p>
        ) : null}
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "self-end rounded-2xl bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-neutral-900"
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
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
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
          placeholder="I've got ribeyes and truffle butter..."
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          Send
        </button>
      </form>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { RecipeDraft } from "@/lib/ai/tools";
import { saveRecipe } from "../chat/actions";

export function ImportClient() {
  const router = useRouter();
  const [mode, setMode] = useState<"text" | "image">("text");
  const [text, setText] = useState("");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveAndOpen(recipe: RecipeDraft) {
    const id = await saveRecipe(recipe, []);
    router.push(`/recipes/${id}`);
  }

  async function importText() {
    if (!text.trim() || importing) return;
    setImporting(true);
    setError(null);
    try {
      const res = await fetch("/api/import-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "text", content: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't import that.");
      await saveAndOpen(data.recipe as RecipeDraft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't import that.");
      setImporting(false);
    }
  }

  function importImage(file: File) {
    setImporting(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const [prefix, base64] = dataUrl.split(",");
        const mediaType = prefix.match(/data:(.*);base64/)?.[1] ?? "image/jpeg";

        const res = await fetch("/api/import-recipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "image", imageBase64: base64, mediaType }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Couldn't read that photo.");
        await saveAndOpen(data.recipe as RecipeDraft);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't read that photo.");
        setImporting(false);
      }
    };
    reader.onerror = () => {
      setError("Couldn't read that file.");
      setImporting(false);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("text")}
          className={mode === "text" ? "font-semibold underline" : "text-neutral-500"}
        >
          Paste text or link
        </button>
        <span className="text-neutral-400">/</span>
        <button
          type="button"
          onClick={() => setMode("image")}
          className={mode === "image" ? "font-semibold underline" : "text-neutral-500"}
        >
          Upload a photo
        </button>
      </div>

      {mode === "text" ? (
        <div className="flex flex-col gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="Paste a recipe link (https://...) or the recipe text itself..."
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button
            type="button"
            onClick={importText}
            disabled={importing || !text.trim()}
            className="self-start rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent-400 dark:text-white"
          >
            {importing ? "Saving to your book..." : "Import"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importImage(file);
            }}
            className="text-sm"
          />
          {importing ? <p className="text-sm text-neutral-400">Reading the photo and saving it to your book...</p> : null}
        </div>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

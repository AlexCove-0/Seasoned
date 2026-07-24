"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { RecipeDraft } from "@/lib/ai/tools";
import { saveRecipe } from "../chat/actions";

export function ImportClient() {
  const router = useRouter();
  const [mode, setMode] = useState<"text" | "image">("text");
  const [text, setText] = useState("");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<RecipeDraft | null>(null);
  const [saving, startSaving] = useTransition();

  async function importText() {
    if (!text.trim() || importing) return;
    setImporting(true);
    setError(null);
    setRecipe(null);
    try {
      const res = await fetch("/api/import-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "text", content: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't import that.");
      setRecipe(data.recipe as RecipeDraft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't import that.");
    } finally {
      setImporting(false);
    }
  }

  function importImage(file: File) {
    setImporting(true);
    setError(null);
    setRecipe(null);
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
        setRecipe(data.recipe as RecipeDraft);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't read that photo.");
      } finally {
        setImporting(false);
      }
    };
    reader.onerror = () => {
      setError("Couldn't read that file.");
      setImporting(false);
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!recipe) return;
    startSaving(async () => {
      const id = await saveRecipe(recipe, []);
      router.push(`/recipes/${id}`);
    });
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
            {importing ? "Reading..." : "Import"}
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
          {importing ? <p className="text-sm text-neutral-400">Reading the photo...</p> : null}
        </div>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

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
    </div>
  );
}

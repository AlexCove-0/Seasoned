"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PHOTO_BUCKET, photoUrl, resizeImage } from "@/lib/photos";

export function PhotoPicker({
  householdId,
  initialPath,
  onUploaded,
  label = "Add a photo",
  aspect = "aspect-[4/3]",
}: {
  householdId: string;
  initialPath?: string | null;
  /** Fires with the storage path once the upload lands, or null when cleared. */
  onUploaded: (path: string | null) => void | Promise<void>;
  label?: string;
  aspect?: string;
}) {
  const [path, setPath] = useState<string | null>(initialPath ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const resized = await resizeImage(file);
      const objectPath = `${householdId}/${crypto.randomUUID()}.jpg`;

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(objectPath, resized, { contentType: "image/jpeg" });

      if (uploadError) throw new Error(uploadError.message);

      setPath(objectPath);
      await onUploaded(objectPath);
    } catch (e) {
      setError(e instanceof Error ? e.message : "That photo didn't upload.");
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    setPath(null);
    setError(null);
    await onUploaded(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Reset so picking the same file twice still fires a change event.
          e.target.value = "";
          if (file) handleFile(file);
        }}
      />

      {path ? (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl(path)}
            alt=""
            className={`w-full rounded-xl object-cover ${aspect}`}
            loading="lazy"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="rounded-lg bg-neutral-100 px-3 py-2.5 text-sm font-medium disabled:opacity-50 dark:bg-neutral-900"
            >
              {busy ? "Uploading..." : "Replace"}
            </button>
            <button
              type="button"
              onClick={clear}
              disabled={busy}
              className="rounded-lg px-3 py-2.5 text-sm text-neutral-500 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl bg-neutral-100 text-sm font-medium text-neutral-500 disabled:opacity-50 dark:bg-neutral-900 ${aspect}`}
        >
          <span aria-hidden="true" className="text-2xl">
            {busy ? "..." : "+"}
          </span>
          {busy ? "Uploading..." : label}
        </button>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

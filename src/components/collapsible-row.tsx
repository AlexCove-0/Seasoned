"use client";

import { useState } from "react";

/**
 * Settings that are long to display but rarely edited (appliance lists,
 * pantry staples) collapse to a one-line summary and open on tap. Showing
 * every chip permanently is what made My Kitchen scroll forever.
 */
export function CollapsibleRow({
  label,
  summary,
  children,
  defaultOpen = false,
}: {
  label: string;
  summary: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-medium">{label}</span>
        <span className="flex items-center gap-2 text-xs text-neutral-500">
          {summary}
          <span
            aria-hidden="true"
            className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          >
            &rsaquo;
          </span>
        </span>
      </button>
      {/* Expanded content drops back to the page ground so the tonal fills of
          nested inputs and chips stay visible against it. */}
      {open ? (
        <div className="bg-neutral-50 px-4 pt-3.5 pb-4 dark:bg-neutral-950">{children}</div>
      ) : null}
    </div>
  );
}

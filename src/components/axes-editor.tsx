"use client";

import { useState } from "react";
import { AXES, type AxisId, type FlavorAxes } from "@/lib/flavor/axes";

const NEUTRAL: FlavorAxes = {
  bitter: 50, heat: 50, richness: 50, acid: 50, funk: 50, sweet_savory: 50, adventure: 50,
};

/**
 * Direct control over the seven axes. A quiz is an inference, and inferences
 * are wrong sometimes -- the person eating is the authority on their own
 * palate, so they get the final say rather than being told to retake it.
 *
 * Steps of 5: finer than that is false precision on a scale nobody
 * experiences numerically.
 */
export function AxesEditor({
  initial,
  onSave,
  saving = false,
}: {
  initial: FlavorAxes | null;
  onSave: (axes: FlavorAxes) => void;
  saving?: boolean;
}) {
  const [axes, setAxes] = useState<FlavorAxes>(initial ?? NEUTRAL);
  const [dirty, setDirty] = useState(false);

  function set(id: AxisId, value: number) {
    setAxes((prev) => ({ ...prev, [id]: value }));
    setDirty(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-neutral-500">
        Drag any of these if the quiz read you wrong. Recipes use these numbers directly.
      </p>

      {AXES.map((axis) => (
        <div key={axis.id} className="flex flex-col gap-1">
          <label htmlFor={`axis-${axis.id}`} className="text-center text-xs font-medium">
            {axis.name}
          </label>
          <input
            id={`axis-${axis.id}`}
            type="range"
            min={0}
            max={100}
            step={5}
            value={axes[axis.id]}
            onChange={(e) => set(axis.id, Number(e.target.value))}
            className="w-full accent-accent-600 dark:accent-accent-400"
          />
          <div className="flex justify-between text-[11px] text-neutral-400">
            <span>{axis.lowPole}</span>
            <span>{axis.highPole}</span>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={saving || !dirty}
          onClick={() => {
            onSave(axes);
            setDirty(false);
          }}
          className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-accent-400"
        >
          {saving ? "Saving..." : "Save preferences"}
        </button>
        {dirty ? (
          <button
            type="button"
            onClick={() => {
              setAxes(initial ?? NEUTRAL);
              setDirty(false);
            }}
            className="text-xs text-neutral-500 underline underline-offset-2"
          >
            Undo changes
          </button>
        ) : null}
      </div>
    </div>
  );
}

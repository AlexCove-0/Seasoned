import { AXES, type FlavorAxes } from "@/lib/flavor/axes";

/** Quarter marks, so the dot's position reads as a position on a scale. */
const GRADUATIONS = [25, 50, 75];

/**
 * The seven spectra as dots on graduated tracks. When `previous` is
 * supplied, a faint tick marks where each axis used to sit, so drift is
 * visible at a glance.
 *
 * Deliberately no printed score: a bare "88" invites reading the axes as
 * grades to max out, when they're positions between two equally valid poles.
 * The quarter marks give the dot precision without that framing.
 */
export function AxesChart({
  axes,
  previous = null,
}: {
  axes: FlavorAxes;
  previous?: FlavorAxes | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      {AXES.map((axis) => {
        const value = axes[axis.id];
        const before = previous?.[axis.id];
        return (
          <div key={axis.id} className="flex flex-col gap-1.5">
            {/* Centered over its own track: left-aligned, the name read as
                belonging to the low pole rather than the whole spectrum. */}
            <div className="text-center text-xs font-medium">{axis.name}</div>

            <div className="relative h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800">
              {GRADUATIONS.map((g) => (
                <span
                  key={g}
                  aria-hidden="true"
                  className={
                    g === 50
                      ? "absolute top-0 h-1.5 w-px bg-neutral-300 dark:bg-neutral-700"
                      : "absolute top-0.5 h-0.5 w-px bg-neutral-300 dark:bg-neutral-700"
                  }
                  style={{ left: `${g}%` }}
                />
              ))}

              {typeof before === "number" ? (
                <span
                  className="absolute -top-0.5 h-2.5 w-0.5 -translate-x-1/2 rounded bg-neutral-400 dark:bg-neutral-600"
                  style={{ left: `${before}%` }}
                  aria-hidden="true"
                  title="Where this sat last time"
                />
              ) : null}

              <span
                className="absolute -top-1 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-neutral-50 bg-accent-600 dark:border-neutral-950 dark:bg-accent-400"
                style={{ left: `${value}%` }}
                role="img"
                aria-label={`${axis.name}: ${value} out of 100, between ${axis.lowPole} and ${axis.highPole}`}
              />
            </div>

            <div className="flex justify-between text-[11px] text-neutral-400">
              <span>{axis.lowPole}</span>
              <span>{axis.highPole}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

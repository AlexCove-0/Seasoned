import { AXES, type FlavorAxes } from "@/lib/flavor/axes";

/**
 * The seven spectra as dots on tracks. When `previous` is supplied, a faint
 * tick marks where each axis used to sit, so drift is visible at a glance.
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
        const drift = typeof before === "number" ? value - before : null;
        return (
          <div key={axis.id} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-medium">{axis.name}</span>
              <span className="font-mono text-neutral-400 tabular-nums">
                {drift !== null && Math.abs(drift) >= 5 ? (
                  <span className="mr-1.5 text-accent-600 dark:text-accent-400">
                    {drift > 0 ? "▲" : "▼"}
                    {Math.abs(drift)}
                  </span>
                ) : null}
                {value}
              </span>
            </div>
            <div className="relative h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800">
              {typeof before === "number" ? (
                <span
                  className="absolute -top-0.5 h-2.5 w-0.5 -translate-x-1/2 rounded bg-neutral-400 dark:bg-neutral-600"
                  style={{ left: `${before}%` }}
                  aria-hidden="true"
                />
              ) : null}
              <span
                className="absolute -top-1 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-neutral-50 bg-accent-600 dark:border-neutral-950 dark:bg-accent-400"
                style={{ left: `${value}%` }}
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

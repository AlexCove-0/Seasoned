"use client";

/**
 * Tap-to-cross-off ingredient rows. Controlled: the parent owns the checked
 * set, since it may care (e.g. the recipe page only sends unchecked items to
 * the shopping list). State is deliberately ephemeral -- checking off is a
 * mise-en-place gesture, not data worth keeping.
 */
export function IngredientChecklist({
  lines,
  checked,
  onToggle,
}: {
  lines: string[];
  checked: Set<number>;
  onToggle: (index: number) => void;
}) {
  return (
    <ul className="flex flex-col">
      {lines.map((line, i) => {
        const isChecked = checked.has(i);
        return (
          <li key={i}>
            <button
              type="button"
              onClick={() => onToggle(i)}
              aria-pressed={isChecked}
              className="flex w-full items-center gap-2.5 rounded-md px-1 py-1.5 text-left text-sm transition-colors hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
            >
              <span
                aria-hidden="true"
                className={
                  isChecked
                    ? "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-accent-600 text-[10px] text-white dark:bg-accent-400"
                    : "h-4.5 w-4.5 shrink-0 rounded-full border-[1.5px] border-neutral-300 dark:border-neutral-600"
                }
              >
                {isChecked ? "✓" : null}
              </span>
              <span className={isChecked ? "text-neutral-400 line-through" : ""}>{line}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

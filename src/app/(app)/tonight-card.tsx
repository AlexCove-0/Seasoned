import Link from "next/link";
import { photoUrl } from "@/lib/photos";

export type TonightMeal = {
  id: string;
  recipe_id: string | null;
  recipe_title: string | null;
  recipe_image: string | null;
  note: string | null;
};

/**
 * The "what are we eating" answer, above everything else. When nothing's
 * planned it stays a single quiet line rather than a nagging empty state --
 * plenty of nights are decided at the stove, and that's fine.
 */
export function TonightCard({ meals }: { meals: TonightMeal[] }) {
  if (meals.length === 0) {
    return (
      <section className="flex items-center justify-between gap-3 rounded-xl bg-neutral-100 px-4 py-3 dark:bg-neutral-900">
        <span className="text-sm text-neutral-500">Nothing planned for tonight.</span>
        <Link
          href="/plan"
          className="shrink-0 text-sm font-medium text-accent-600 underline underline-offset-2 dark:text-accent-400"
        >
          Plan the week
        </Link>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[11px] font-semibold tracking-[0.12em] text-neutral-500 uppercase">
          Tonight
        </h2>
        <Link href="/plan" className="text-xs text-neutral-500 underline underline-offset-2">
          This week
        </Link>
      </div>

      <ul className="flex flex-col gap-2">
        {meals.map((meal) => {
          if (!meal.recipe_id) {
            return (
              <li
                key={meal.id}
                className="rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
              >
                {meal.note}
              </li>
            );
          }
          return (
            <li key={meal.id} className="overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900">
              <Link href={`/recipes/${meal.recipe_id}`} className="flex items-center gap-3 p-2 pr-4">
                {meal.recipe_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl(meal.recipe_image)}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="h-14 w-14 shrink-0 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                )}
                <span className="flex-1 text-sm font-medium">{meal.recipe_title}</span>
              </Link>
              <Link
                href={`/recipes/${meal.recipe_id}/cook`}
                className="block bg-accent-600 px-4 py-2.5 text-center text-sm font-semibold text-white dark:bg-accent-400"
              >
                Start cooking
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import Link from "next/link";
import type { RecipeCardData } from "@/lib/recipe-ranking";

export function RecipeCarousel({
  title,
  recipes,
  emptyText,
}: {
  title: string;
  recipes: RecipeCardData[];
  emptyText: string;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-medium">{title}</h2>
      {recipes.length === 0 ? (
        <p className="text-sm text-neutral-500">{emptyText}</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {recipes.map((r) => (
            <Link
              key={r.id}
              href={`/recipes/${r.id}`}
              className="flex w-40 shrink-0 flex-col gap-1 rounded-lg border border-neutral-200 p-3 text-sm hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
            >
              <span className="font-medium">{r.title}</span>
              <span className="text-xs text-neutral-500">{r.subtitle}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

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
      <h2 className="text-[11px] font-semibold tracking-[0.12em] text-neutral-500 uppercase">
        {title}
      </h2>
      {recipes.length === 0 ? (
        <p className="text-sm text-neutral-500">{emptyText}</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {recipes.map((r) => (
            <Link
              key={r.id}
              href={`/recipes/${r.id}`}
              className="flex w-40 shrink-0 flex-col gap-1 rounded-xl bg-neutral-100 p-3.5 text-sm transition-colors hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
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

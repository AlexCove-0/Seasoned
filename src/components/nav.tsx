"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Recipes" },
  { href: "/plan", label: "This Week" },
  { href: "/kitchen", label: "Kitchen" },
  { href: "/shopping-list", label: "List" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-20 bg-neutral-50/85 backdrop-blur dark:bg-neutral-950/85">
      <div className="mx-auto flex max-w-2xl items-center gap-1 px-4 py-2.5">
        {LINKS.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active
                  ? "shrink-0 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900"
                  : "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
              }
            >
              {link.label}
            </Link>
          );
        })}
        <form action="/auth/signout" method="post" className="ml-auto shrink-0">
          <button type="submit" className="text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}

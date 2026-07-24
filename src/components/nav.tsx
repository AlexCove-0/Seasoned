"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Recipe Book" },
  { href: "/chat", label: "Create a Recipe" },
  { href: "/kitchen", label: "My Kitchen" },
  { href: "/shopping-list", label: "Shopping List" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-2xl items-center gap-1 overflow-x-auto px-4 py-2">
        {LINKS.map((link) => {
          const active =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active
                  ? "shrink-0 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-neutral-900"
                  : "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }
            >
              {link.label}
            </Link>
          );
        })}
        <form action="/auth/signout" method="post" className="ml-auto shrink-0">
          <button type="submit" className="text-xs text-neutral-500 underline">
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}

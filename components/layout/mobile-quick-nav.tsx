"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MobileQuickNav({ items }: { items: string[][] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Mobile quick navigation" className="container-px mx-auto flex max-w-7xl snap-x gap-2 overflow-x-auto scroll-px-4 pb-3 xl:hidden hide-scrollbar">
      {items.map(([label, href]) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-h-9 shrink-0 snap-start items-center whitespace-nowrap rounded-full border bg-card/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground",
              active && "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

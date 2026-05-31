"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, Home, LayoutDashboard, Search, ShieldCheck } from "lucide-react";
import { LogoMark } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", href: "/", icon: Home },
  { label: "Check", href: "/checker", icon: Search },
  { label: "Start", href: "/onboarding", icon: ShieldCheck },
  { label: "Data", href: "/scam-database", icon: Database },
  { label: "Dash", href: "/dashboard", icon: LayoutDashboard }
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/96 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-0.5 px-1 pt-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground min-[360px]:text-[11px]",
                active && "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-200"
              )}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4 shrink-0" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="mx-auto mb-1 mt-0.5 flex items-center justify-center gap-1.5 text-[10px] font-medium text-muted-foreground">
        <LogoMark className="size-3.5" /> TrustCheck AI
      </div>
    </nav>
  );
}

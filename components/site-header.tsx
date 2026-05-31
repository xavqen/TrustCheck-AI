import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandLogo } from "@/components/brand-logo";
import { MobileQuickNav } from "@/components/layout/mobile-quick-nav";

const primaryNav = [
  ["Checker", "/checker"],
  ["Pricing", "/pricing"],
  ["Alerts", "/alerts"],
  ["Database", "/scam-database"],
  ["API Docs", "/docs/api"],
  ["Start", "/onboarding"]
];

const moreNav = [
  ["Billing", "/billing"],
  ["Extension", "/extension"],
  ["Scam Types", "/scam-types"],
  ["Threat Map", "/threat-map"],
  ["Brand Check", "/tools/brand-inspector"],
  ["URL Inspector", "/tools/url-inspector"],
  ["Trust Widget", "/tools/trust-widget"],
  ["Emergency", "/emergency"],
  ["Directory", "/reporting-directory"],
  ["Report", "/report"]
];

const mobileNav = [...primaryNav, ...moreNav];

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/92 backdrop-blur-xl supports-[backdrop-filter]:bg-background/78">
      <div className="container-px mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 py-2 sm:gap-3">
        <div className="min-w-0 flex-1 xl:flex-none">
          <BrandLogo textClassName="hidden sm:inline" />
        </div>

        <nav aria-label="Main navigation" className="hidden min-w-0 items-center gap-1 xl:flex">
          {primaryNav.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
              {label}
            </Link>
          ))}
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground [&::-webkit-details-marker]:hidden">
              More <ChevronDown className="size-4 transition group-open:rotate-180" />
            </summary>
            <div className="absolute right-0 mt-2 max-h-[70vh] w-60 overflow-y-auto rounded-3xl border bg-card p-2 shadow-lg">
              {moreNav.map(([label, href]) => (
                <Link key={href} href={href} className="block rounded-2xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground">
                  {label}
                </Link>
              ))}
            </div>
          </details>
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
          <ThemeToggle />
          {session?.user ? (
            <>
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex"><Link href="/settings">Settings</Link></Button>
              <Button asChild variant="outline" size="sm" className="hidden min-[430px]:inline-flex"><Link href="/dashboard">Dashboard</Link></Button>
              <span className="hidden md:inline-flex"><SignOutButton /></span>
            </>
          ) : (
            <>
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex"><Link href="/signup">Sign up</Link></Button>
              <Button asChild size="sm"><Link href="/login">Login</Link></Button>
            </>
          )}
        </div>
      </div>

      <MobileQuickNav items={mobileNav} />
    </header>
  );
}

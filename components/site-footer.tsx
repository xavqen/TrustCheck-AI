import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

const links = [
  ["Onboarding", "/onboarding"],
  ["Alerts", "/alerts"],
  ["Extension", "/extension"],
  ["Trust widget", "/tools/trust-widget"],
  ["Billing", "/billing"],
  ["Threat map", "/threat-map"],
  ["Emergency", "/emergency"],
  ["Scam database", "/scam-database"],
  ["Scam types", "/scam-types"],
  ["Directory", "/reporting-directory"],
  ["Brand checker", "/tools/brand-inspector"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
  ["Disclaimer", "/disclaimer"],
  ["Contact", "/contact"]
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-card/60 pb-20 md:pb-0">
      <div className="container-px mx-auto grid max-w-7xl gap-8 py-8 text-sm text-muted-foreground md:grid-cols-[0.9fr_1.1fr] md:py-10">
        <div className="space-y-3">
          <BrandLogo />
          <p className="max-w-md text-pretty leading-relaxed">© {new Date().getFullYear()} TrustCheck AI. Scam risk assistant for safer digital decisions across mobile and desktop.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:justify-items-end lg:grid-cols-4">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="min-h-10 rounded-xl px-2 py-2 transition hover:bg-muted hover:text-foreground">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

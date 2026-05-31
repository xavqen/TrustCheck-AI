import type { Metadata } from "next";
import { BrandInspector } from "@/components/tools/brand-inspector";
import { BRAND_WATCHLIST } from "@/lib/intel/brand-watchlist";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Brand Impersonation Checker",
  description: "Check whether a suspicious message or link may be impersonating banks, wallets, shopping apps, social platforms or subscription brands."
};

export default function BrandInspectorPage() {
  return (
    <section className="container-px mx-auto max-w-7xl py-10">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <Badge variant="secondary">New tool</Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Brand impersonation checker</h1>
        <p className="mt-4 text-muted-foreground">Detect fake bank, wallet, shopping, email, courier and social-account messages that abuse trusted brand names.</p>
      </div>
      <BrandInspector />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {BRAND_WATCHLIST.map((brand) => (
          <Card key={brand.name}>
            <CardContent className="p-4">
              <p className="font-semibold">{brand.name}</p>
              <p className="text-xs text-muted-foreground">{brand.category}</p>
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">Official domains: {brand.officialDomains.join(", ")}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

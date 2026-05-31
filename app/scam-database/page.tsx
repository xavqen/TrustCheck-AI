import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Database, Globe2, Users, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PublicReportCard } from "@/components/intel/public-report-card";
import { ScamDatabaseFilters } from "@/components/intel/scam-database-filters";

export const metadata: Metadata = {
  title: "Public scam database",
  description: "Search anonymized community scam reports by country, platform, scam type, and keyword."
};

function clean(value?: string) {
  return sanitizeText(value || "").slice(0, 80);
}

function topCounts(items: string[], limit = 6) {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item, (counts.get(item) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

export default async function ScamDatabasePage({ searchParams }: { searchParams: Promise<{ q?: string; country?: string; type?: string; platform?: string }> }) {
  const params = await searchParams;
  const q = clean(params.q);
  const country = clean(params.country);
  const type = clean(params.type);
  const platform = clean(params.platform);

  const where: Prisma.ScamReportWhereInput = {
    isPublic: true,
    status: "approved",
    ...(country ? { country: { contains: country, mode: "insensitive" } } : {}),
    ...(type ? { scamType: { contains: type, mode: "insensitive" } } : {}),
    ...(platform ? { platform: { contains: platform, mode: "insensitive" } } : {}),
    ...(q ? {
      OR: [
        { scamType: { contains: q, mode: "insensitive" } },
        { platform: { contains: q, mode: "insensitive" } },
        { country: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } }
      ]
    } : {})
  };

  const [reports, total, statsSource] = await Promise.all([
    prisma.scamReport.findMany({
      where,
      orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
      take: 30,
      select: { id: true, publicSlug: true, scamType: true, platform: true, country: true, description: true, createdAt: true, upvotes: true, views: true }
    }),
    prisma.scamReport.count({ where }),
    prisma.scamReport.findMany({
      where: { isPublic: true, status: "approved" },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: { scamType: true, platform: true, country: true }
    })
  ]);

  const topTypes = topCounts(statsSource.map((item) => item.scamType));
  const topCountries = topCounts(statsSource.map((item) => item.country));

  return (
    <section className="container-px mx-auto max-w-7xl py-10">
      <div className="grid min-w-0 gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
        <div>
          <Badge variant="secondary">Community intelligence</Badge>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Public scam database</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Search anonymized reports submitted by users. Use it to spot repeated scam patterns before clicking links, sending money, or sharing documents.
          </p>
          <div className="mt-6 responsive-actions">
            <Button asChild><Link href="/report">Submit report</Link></Button>
            <Button asChild variant="outline"><Link href="/checker">Check suspicious content</Link></Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Stat icon={Database} label="Matching reports" value={total} />
          <Stat icon={Globe2} label="Countries tracked" value={new Set(statsSource.map((item) => item.country.toLowerCase())).size} />
          <Stat icon={Users} label="Public entries" value={statsSource.length} />
        </div>
      </div>

      <div className="mt-8"><ScamDatabaseFilters q={q} country={country} type={type} platform={platform} /></div>

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
          <Card>
            <CardContent className="p-5">
              <h2 className="font-bold">Top scam types</h2>
              <div className="mt-4 space-y-2">
                {topTypes.length ? topTypes.map(([name, count]) => <Pill key={name} href={`/scam-database?type=${encodeURIComponent(name)}`} label={name} count={count} />) : <p className="text-sm text-muted-foreground">No public data yet.</p>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h2 className="font-bold">Top countries</h2>
              <div className="mt-4 space-y-2">
                {topCountries.length ? topCountries.map(([name, count]) => <Pill key={name} href={`/scam-database?country=${encodeURIComponent(name)}`} label={name} count={count} />) : <p className="text-sm text-muted-foreground">No public data yet.</p>}
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-4">
          {reports.length === 0 ? (
            <EmptyState title="No public reports found" description="Try a different keyword or submit the first anonymous report for this pattern." />
          ) : reports.map((report) => <PublicReportCard key={report.id} report={report} />)}
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200"><Icon className="size-5" /></div>
        <div className="min-w-0">
          <p className="text-2xl font-black">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Pill({ href, label, count }: { href: string; label: string; count: number }) {
  return (
    <Link href={href} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-sm transition hover:bg-muted">
      <span className="min-w-0 truncate">{label}</span>
      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-bold">{count}</span>
    </Link>
  );
}

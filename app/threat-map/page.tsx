import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, BarChart3, Globe2, ShieldAlert } from "lucide-react";
import { getThreatSummary } from "@/lib/intel/threats";
import { COUNTRY_GUIDES } from "@/lib/intel/country-guidance";
import { ThreatChart } from "@/components/intel/threat-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Global Scam Threat Map",
  description: "See anonymized scam risk trends, common scam types, country report guidance and recent dangerous scam patterns."
};

export const dynamic = "force-dynamic";

function riskVariant(label: string) {
  if (label === "DANGEROUS") return "danger" as const;
  if (label === "SUSPICIOUS") return "warning" as const;
  return "safe" as const;
}

export default async function ThreatMapPage() {
  const summary = await getThreatSummary(30);
  const dangerous = summary.risk.find((item) => item.label === "DANGEROUS")?.count || 0;
  const suspicious = summary.risk.find((item) => item.label === "SUSPICIOUS")?.count || 0;

  return (
    <div className="container-px mx-auto max-w-7xl py-10">
      <div className="mb-8 grid min-w-0 gap-6 xl:grid-cols-[1fr_360px]">
        <div>
          <Badge variant="secondary">Threat intelligence</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Global scam threat map</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Anonymous product signals help users understand active scam patterns without exposing private check content.
          </p>
          <div className="mt-6 responsive-actions">
            <Button asChild><Link href="/checker">Check suspicious content</Link></Button>
            <Button asChild variant="outline"><Link href="/emergency">I may have been scammed</Link></Button>
          </div>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert className="size-5 text-red-600" /> Active risk window</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-center min-[430px]:grid-cols-3">
            <div className="rounded-2xl border p-4"><p className="text-2xl font-bold">{summary.totalChecks}</p><p className="text-xs text-muted-foreground">checks</p></div>
            <div className="rounded-2xl border p-4"><p className="text-2xl font-bold text-amber-600">{suspicious}</p><p className="text-xs text-muted-foreground">suspicious</p></div>
            <div className="rounded-2xl border p-4"><p className="text-2xl font-bold text-red-600">{dangerous}</p><p className="text-xs text-muted-foreground">dangerous</p></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[1fr_380px]">
        <ThreatChart data={summary.daily} />
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="size-5" /> Risk split</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {summary.risk.map((item) => (
              <div key={item.label} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
                <Badge variant={riskVariant(item.label)}>{item.label.toLowerCase()}</Badge>
                <span className="text-2xl font-bold">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top scam categories</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {summary.byType.length ? summary.byType.map((item) => (
              <div key={item.label} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 capitalize">
                <span>{item.label}</span><span className="font-bold">{item.count}</span>
              </div>
            )) : <p className="text-sm text-muted-foreground">No scam checks yet. Data appears after users run checks.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe2 className="size-5" /> Reported countries</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {summary.byCountry.length ? summary.byCountry.map((item) => (
              <div key={item.country} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
                <span>{item.country}</span><span className="font-bold">{item.count}</span>
              </div>
            )) : <p className="text-sm text-muted-foreground">No country reports yet. Submit reports to build public safety intelligence.</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Country reporting directory</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {COUNTRY_GUIDES.map((guide) => (
            <div key={guide.code} className="rounded-2xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">{guide.country}</h2><Badge variant="outline">{guide.code}</Badge></div>
              <p className="mt-3 text-sm text-muted-foreground">{guide.emergency}</p>
              <p className="mt-3 break-words text-xs text-muted-foreground">{guide.cybercrimePortal}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6 border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/20">
        <CardContent className="flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3"><AlertTriangle className="mt-1 size-5 text-red-600" /><div><h2 className="font-semibold">Lost money or shared OTP/password?</h2><p className="text-sm text-muted-foreground">Act fast. Freeze payment channels first, then preserve evidence and report.</p></div></div>
          <Button asChild variant="destructive"><Link href="/emergency">Open emergency checklist</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Siren } from "lucide-react";
import { getThreatSummary } from "@/lib/intel/threats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertSubscribeForm } from "@/components/alerts/alert-subscribe-form";

export const metadata: Metadata = {
  title: "Live Scam Alerts",
  description: "Recent anonymized dangerous scam patterns and user reports from TrustCheck AI."
};

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default async function AlertsPage() {
  const summary = await getThreatSummary(30);

  return (
    <div className="container-px mx-auto max-w-6xl py-10">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="danger">Live alerts</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Recent scam patterns</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">Private inputs are never displayed here. These alerts show only anonymized risk type, score and red-flag patterns.</p>
        </div>
        <Button asChild><Link href="/report">Report a scam</Link></Button>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Siren className="size-5 text-red-600" /> Dangerous checks</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {summary.recentDangerous.length ? summary.recentDangerous.map((item) => (
              <div key={item.id} className="rounded-2xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge variant="danger">{item.type.replaceAll("_", " ").toLowerCase()}</Badge>
                  <span className="text-sm font-semibold text-red-600">Trust score {item.trustScore}/100</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{item.reason}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.redFlags.map((flag) => <Badge key={String(flag)} variant="outline">{String(flag)}</Badge>)}
                </div>
                <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Clock className="size-3" /> {formatDate(item.createdAt)}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">No dangerous checks yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent public reports</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {summary.recentReports.length ? summary.recentReports.map((item) => (
              <div key={item.id} className="rounded-2xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3"><Badge variant="warning">{item.scamType}</Badge><span className="text-xs text-muted-foreground">{item.country}</span></div>
                <p className="mt-2 text-sm text-muted-foreground">Platform: {item.platform}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">No reports yet. Your community reports will appear here as anonymized statistics.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid min-w-0 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Badge variant="secondary">Retention</Badge>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">Subscribe to scam alerts</h2>
          <p className="mt-2 text-muted-foreground">Users can follow country-specific patterns and receive daily, weekly or critical-only scam warnings.</p>
        </div>
        <AlertSubscribeForm source="alerts_page" />
      </div>
    </div>
  );
}

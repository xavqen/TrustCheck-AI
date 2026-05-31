import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Mail, MousePointerClick, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Lead inbox",
  description: "Admin lead inbox for TrustCheck AI alerts, extension and widget requests."
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export default async function AdminLeadsPage() {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) redirect("/login");

  const [leads, subscriptions, leadCount, subscriptionCount] = await Promise.all([
    prisma.integrationLead.findMany({ orderBy: { createdAt: "desc" }, take: 40 }),
    prisma.alertSubscription.findMany({ orderBy: { createdAt: "desc" }, take: 40 }),
    prisma.integrationLead.count(),
    prisma.alertSubscription.count()
  ]);

  return (
    <section className="container-px mx-auto max-w-7xl py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="secondary">Admin</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Lead inbox</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">Review browser extension, trust widget, API and alert subscribers captured from public conversion pages.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat icon={<Users className="size-5" />} label="Integration leads" value={leadCount} />
        <Stat icon={<Mail className="size-5" />} label="Alert subscribers" value={subscriptionCount} />
        <Stat icon={<MousePointerClick className="size-5" />} label="New leads" value={leads.filter((lead) => lead.status === "new").length} />
      </div>

      <div className="mt-8 grid min-w-0 gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader><CardTitle>Integration requests</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {leads.length ? leads.map((lead) => (
              <div key={lead.id} className="rounded-2xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold break-words">{lead.name}</p>
                    <p className="text-sm text-muted-foreground break-words">{lead.email}{lead.company ? ` • ${lead.company}` : ""}</p>
                  </div>
                  <Badge variant={lead.status === "new" ? "warning" : "outline"}>{lead.status}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2"><Badge variant="secondary">{lead.source}</Badge>{lead.volume ? <Badge variant="outline">{lead.volume}</Badge> : null}</div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground break-words">{lead.useCase}</p>
                <p className="mt-3 text-xs text-muted-foreground">{formatDate(lead.createdAt)}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">No integration leads yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Alert subscribers</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {subscriptions.length ? subscriptions.map((item) => (
              <div key={item.id} className="rounded-2xl border p-4">
                <p className="font-semibold break-words">{item.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">{item.frequency.replaceAll("_", " ")}</Badge>
                  {item.country ? <Badge variant="outline">{item.country}</Badge> : null}
                  <Badge variant="outline">{item.source}</Badge>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">No alert subscribers yet.</p>}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return <Card><CardContent className="flex items-center gap-4 p-5"><div className="rounded-2xl bg-primary/10 p-3 text-primary">{icon}</div><div><p className="text-2xl font-black">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div></CardContent></Card>;
}

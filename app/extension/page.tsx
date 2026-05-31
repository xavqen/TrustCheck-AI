import type { Metadata } from "next";
import Link from "next/link";
import { BellRing, MousePointerClick, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { AlertSubscribeForm } from "@/components/alerts/alert-subscribe-form";
import { IntegrationLeadForm } from "@/components/growth/integration-lead-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Browser extension waitlist",
  description: "Join the TrustCheck AI extension waitlist for one-click scam checks in WhatsApp Web, email, job portals and marketplaces."
};

const features: { title: string; description: string; icon: LucideIcon }[] = [
  { title: "One-click link check", description: "Highlight a URL or message and send it to TrustCheck AI without leaving the page.", icon: MousePointerClick },
  { title: "Safer before login", description: "Spot fake KYC, delivery, job and bank pages before entering sensitive information.", icon: ShieldCheck },
  { title: "Live scam alerts", description: "Get high-risk campaign warnings by country and scam category.", icon: BellRing }
];

export default function ExtensionPage() {
  return (
    <section className="container-px mx-auto max-w-7xl py-10">
      <div className="grid min-w-0 gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
        <div>
          <Badge variant="secondary">Upcoming extension</Badge>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">Check scams directly inside your browser.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            A lightweight TrustCheck AI companion for Gmail, WhatsApp Web, job portals, shopping pages and crypto offers. The current app already supports manual checks; this page captures early-access demand.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg"><Link href="#waitlist">Join waitlist</Link></Button>
            <Button asChild variant="outline" size="lg"><Link href="/checker">Use web checker now</Link></Button>
          </div>
        </div>
        <Card className="overflow-hidden border-sky-200/70 bg-gradient-to-br from-sky-50 to-emerald-50 dark:border-sky-900 dark:from-sky-950/40 dark:to-emerald-950/20">
          <CardContent className="p-6 sm:p-8">
            <div className="rounded-[2rem] border bg-background/80 p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge variant="safe">Preview</Badge>
                <span className="text-xs font-semibold text-muted-foreground">trustcheck://scan</span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border bg-card p-4"><p className="text-sm font-semibold">Suspicious page detected</p><p className="mt-1 text-xs text-muted-foreground">Fake authority + urgent KYC language + risky domain keywords.</p></div>
                <div className="rounded-2xl border bg-card p-4"><p className="text-sm font-semibold text-red-600">Trust score: 21/100</p><p className="mt-1 text-xs text-muted-foreground">Recommended action: close page, do not enter OTP/password.</p></div>
                <Button className="w-full"><Sparkles className="mr-2 size-4" />Run full AI check</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return <Card key={feature.title}><CardHeader><Icon className="size-7 text-primary" /><CardTitle>{feature.title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{feature.description}</CardContent></Card>;
        })}
      </div>

      <div id="waitlist" className="mt-10 grid min-w-0 gap-6 xl:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Join extension early access</h2>
          <p className="mt-2 text-muted-foreground">Tell us your use case. Admin can review all captured leads from the new leads dashboard.</p>
          <div className="mt-6"><IntegrationLeadForm source="browser_extension" cta="Join extension waitlist" /></div>
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Also get scam alerts</h2>
          <p className="mt-2 text-muted-foreground">Use alerts to bring people back weekly and increase retention without exposing private user checks.</p>
          <div className="mt-6"><AlertSubscribeForm source="extension" /></div>
        </div>
      </div>
    </section>
  );
}

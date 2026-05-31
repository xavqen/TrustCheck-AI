import type { Metadata } from "next";
import Link from "next/link";
import { Code2, Globe2, ShieldAlert, ShieldCheck, type LucideIcon } from "lucide-react";
import { IntegrationLeadForm } from "@/components/growth/integration-lead-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Trust widget for websites",
  description: "Add TrustCheck AI scam safety checks to marketplaces, job boards, fintech products and support workflows."
};

const cards: { title: string; description: string; icon: LucideIcon }[] = [
  { title: "Marketplace safety", description: "Let users check seller links, payment requests and delivery messages before leaving your platform.", icon: Globe2 },
  { title: "Support inbox triage", description: "Classify suspicious user-submitted emails, screenshots and messages before escalation.", icon: ShieldAlert },
  { title: "Business API ready", description: "Use your approved Business key to run high-volume checks from server-side workflows.", icon: Code2 }
];

const embedSnippet = `<script async src="https://your-domain.com/trustcheck-widget.js" data-site="your-site-id"></script>\n<div data-trustcheck-widget data-mode="compact"></div>`;

export default function TrustWidgetPage() {
  return (
    <section className="container-px mx-auto max-w-7xl py-10">
      <div className="grid min-w-0 gap-8 xl:grid-cols-[1fr_0.9fr] xl:items-center">
        <div>
          <Badge variant="secondary">B2B growth tool</Badge>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Embed scam safety into your own product.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            A conversion-ready Trust Widget page for businesses that want phishing, job scam, seller fraud and investment risk checks inside their own app.
          </p>
          <div className="mt-6 responsive-actions">
            <Button asChild size="lg"><Link href="#request">Request widget access</Link></Button>
            <Button asChild variant="outline" size="lg"><Link href="/docs/api">View API docs</Link></Button>
          </div>
        </div>
        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="rounded-3xl border bg-muted/50 p-4">
              <div className="flex items-center gap-3"><ShieldCheck className="size-8 text-emerald-600" /><div><p className="font-bold">TrustCheck Safety Widget</p><p className="text-xs text-muted-foreground">Compact embedded check card</p></div></div>
              <div className="mt-5 rounded-2xl border bg-background p-4 text-sm text-muted-foreground">Paste a message, seller link, QR text or offer. We return a risk label, trust score and safe next step.</div>
              <div className="mt-4 grid gap-2 text-center text-xs font-semibold min-[430px]:grid-cols-3"><div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">Safe</div><div className="rounded-2xl bg-amber-100 p-3 text-amber-800">Suspicious</div><div className="rounded-2xl bg-red-100 p-3 text-red-800">Dangerous</div></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((item) => {
          const Icon = item.icon;
          return <Card key={item.title}><CardHeader><Icon className="size-7 text-primary" /><CardTitle>{item.title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{item.description}</CardContent></Card>;
        })}
      </div>

      <div className="mt-10 grid min-w-0 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader><CardTitle>Future embed snippet</CardTitle></CardHeader>
          <CardContent>
            <pre className="touch-scroll rounded-2xl bg-slate-950 p-4 text-xs text-slate-100"><code>{embedSnippet}</code></pre>
            <p className="mt-3 text-sm text-muted-foreground">This snippet is shown as product positioning. API-first integration is already available through the Business API docs.</p>
          </CardContent>
        </Card>
        <div id="request">
          <IntegrationLeadForm source="trust_widget" cta="Request widget access" />
        </div>
      </div>
    </section>
  );
}

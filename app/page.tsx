import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe2, LockKeyhole, Radar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeroMotion } from "@/components/home/hero-motion";
import { LogoMark } from "@/components/brand-logo";
import { TrustScoreMeter } from "@/components/checker/trust-score-meter";

const features = [
  "Suspicious URL checking",
  "WhatsApp and email scam detection",
  "Job, loan, crypto and shopping fraud checks",
  "Risk score, red flags and safe reply suggestions"
];

const stats = [
  ["$1T+", "estimated annual global scam impact"],
  ["9", "scam categories covered"],
  ["0-100", "trust score output"],
  ["24/7", "self-serve checks"]
];

const pricing = [
  ["Free", "$0", "5 checks/day", "For personal safety checks"],
  ["Pro", "$9", "Unlimited checks", "For creators, sellers and families"],
  ["Family", "$19", "Multiple users", "For households and student groups"],
  ["Business API", "Custom", "High volume", "For platforms and support teams"]
];

const faqs = [
  ["Can it check WhatsApp scams?", "Yes. Paste the message and TrustCheck AI explains pressure tactics, risky links and safe next steps."],
  ["Does it expose API keys?", "No. AI calls happen only from server API routes."],
  ["Can it save my history?", "Yes. Logged-in users get private check history and dashboard analytics."],
  ["Is it legal advice?", "No. It is a safety assistant. Use official cybercrime reporting channels for legal action."]
];

export default function HomePage() {
  return (
    <div>
      <section className="container-px mx-auto grid max-w-7xl gap-8 py-10 sm:py-14 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
        <HeroMotion>
          <Badge className="mb-5 w-fit" variant="safe">Global scam defense assistant</Badge>
          <h1 className="max-w-4xl text-balance text-fluid-title font-black tracking-tight">
            Check suspicious links, messages, QR codes and offers before they trap you.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
            TrustCheck AI detects red flags in phishing links, fake jobs, fake KYC, crypto traps, loan scams, delivery fraud and social engineering messages.
          </p>
          <div className="mt-8 responsive-actions">
            <Button asChild size="lg">
              <Link href="/checker">Check something now <ArrowRight className="ml-2 size-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/scam-database">View scam database</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/onboarding">Start guide</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {features.map((item) => (
              <div key={item} className="flex min-w-0 items-start gap-2 text-sm leading-6 text-muted-foreground">
                <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" /> <span className="break-anywhere">{item}</span>
              </div>
            ))}
          </div>
        </HeroMotion>

        <Card className="safe-gradient shadow-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LogoMark className="size-6" /> Trust score preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border bg-card/80 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Sample message</span>
                <Badge variant="danger">Dangerous</Badge>
              </div>
              <p className="mt-3 text-sm">“Your bank KYC is blocked. Click this link in 10 minutes or account will close.”</p>
            </div>
            <div className="rounded-2xl border bg-card p-4">
              <TrustScoreMeter compact score={18} riskLevel="DANGEROUS" />
            </div>
            <div className="grid gap-3 text-center min-[420px]:grid-cols-2">
              <div className="rounded-2xl border bg-card p-4"><div className="text-3xl font-bold">6</div><p className="text-xs text-muted-foreground">Red flags</p></div>
              <div className="rounded-2xl border bg-card p-4"><div className="text-3xl font-bold">1</div><p className="text-xs text-muted-foreground">Safe action</p></div>
            </div>
            <Button asChild className="w-full"><Link href="/checker">Analyze link/message/screenshot text</Link></Button>
          </CardContent>
        </Card>
      </section>

      <section className="border-y bg-card/60 py-12">
        <div className="container-px mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([value, label]) => (
            <Card key={label}><CardContent className="p-5"><p className="text-3xl font-bold">{value}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></CardContent></Card>
          ))}
        </div>
      </section>

      <section id="how" className="container-px mx-auto max-w-7xl py-16">
        <div className="mb-8 max-w-2xl"><Badge variant="secondary">How it works</Badge><h2 className="mt-3 text-3xl font-bold">Paste, analyze, act safely.</h2></div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[Globe2, Radar, LockKeyhole].map((Icon, index) => (
            <Card key={index}>
              <CardHeader><Icon className="size-8 text-emerald-600" /><CardTitle>{["Paste suspicious content", "Get risk analysis", "Take safe action"][index]}</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {["Choose URL, WhatsApp, email, QR text, job, loan, shopping or investment offer.", "The engine checks urgency pressure, fake authority, money requests, phishing signs and more.", "See red flags, recommended action, safe reply and official report guidance."][index]}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-16">
        <div className="mb-8 max-w-2xl">
          <Badge variant="secondary">New in v12</Badge>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">Use TrustCheck beyond this website.</h2>
          <p className="mt-3 text-muted-foreground">Capture extension users, business widget leads and alert subscribers with responsive conversion pages.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Browser extension</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground"><p>Early-access page for one-click scam checks in browser workflows.</p><Button asChild variant="outline" className="w-full"><Link href="/extension">Open extension page</Link></Button></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Trust widget</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground"><p>B2B page for marketplaces, fintech apps and support inbox safety checks.</p><Button asChild variant="outline" className="w-full"><Link href="/tools/trust-widget">Open widget page</Link></Button></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Scam alerts</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground"><p>Country and category alert subscriptions to increase product retention.</p><Button asChild variant="outline" className="w-full"><Link href="/alerts">Subscribe alerts</Link></Button></CardContent>
          </Card>
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-16" id="pricing">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><Badge variant="secondary">Pricing</Badge><h2 className="mt-3 text-3xl font-bold">Start free, scale when needed.</h2></div><Link className="text-sm font-medium text-emerald-600" href="/pricing">Full pricing</Link></div>
        <div className="responsive-card-grid">
          {pricing.map(([name, price, limit, desc]) => (
            <Card key={name} className={name === "Pro" ? "border-emerald-500 shadow-glow" : ""}>
              <CardHeader><CardTitle>{name}</CardTitle><p className="text-3xl font-bold">{price}</p></CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground"><p>{limit}</p><p>{desc}</p><Button asChild variant={name === "Pro" ? "default" : "outline"} className="w-full"><Link href="/signup">Get started</Link></Button></CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-16">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {["Saved my store from a fake supplier link.", "Perfect for checking viral WhatsApp messages before forwarding.", "The safe reply suggestion is useful for avoiding arguments."].map((quote, index) => (
            <Card key={quote}><CardContent className="p-6"><Sparkles className="mb-4 size-5 text-emerald-600" /><p className="font-medium">“{quote}”</p><p className="mt-3 text-sm text-muted-foreground">TrustCheck user #{index + 1}</p></CardContent></Card>
          ))}
        </div>
      </section>

      <section className="container-px mx-auto max-w-4xl py-16">
        <h2 className="mb-6 text-3xl font-bold">FAQ</h2>
        <div className="space-y-3">
          {faqs.map(([q, a]) => (
            <Card key={q}><CardContent className="p-5"><h3 className="font-semibold">{q}</h3><p className="mt-2 text-sm text-muted-foreground">{a}</p></CardContent></Card>
          ))}
        </div>
      </section>
    </div>
  );
}

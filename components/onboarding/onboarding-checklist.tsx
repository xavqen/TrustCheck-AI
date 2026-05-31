import Link from "next/link";
import { ArrowRight, CheckCircle2, CreditCard, Flag, KeyRound, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    title: "Run your first safety check",
    description: "Paste a suspicious link, WhatsApp text, email, QR text, seller message or offer.",
    href: "/checker",
    icon: Search,
    action: "Open checker"
  },
  {
    title: "Review the trust score",
    description: "Use red flags, reasons, safe reply and guidance before you click, pay or share data.",
    href: "/dashboard",
    icon: ShieldCheck,
    action: "Open dashboard"
  },
  {
    title: "Report dangerous scams",
    description: "Save evidence with scam type, platform, country and description for future reference.",
    href: "/report",
    icon: Flag,
    action: "Create report"
  },
  {
    title: "Choose your plan",
    description: "Free users get daily checks. Pro, Family and Business unlock higher usage flows.",
    href: "/billing",
    icon: CreditCard,
    action: "Open billing"
  },
  {
    title: "Connect the Business API",
    description: "Business users can create server-side keys and send checks from their own product.",
    href: "/settings",
    icon: KeyRound,
    action: "Manage API"
  }
];

export function OnboardingChecklist() {
  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <Card className="safe-gradient h-fit overflow-hidden">
        <CardHeader>
          <Badge variant="safe" className="w-fit">Start here</Badge>
          <CardTitle className="text-2xl sm:text-3xl">Set up TrustCheck AI in five minutes.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>Use this checklist to test the complete product flow across mobile, desktop, user dashboard, billing, reports and Business API readiness.</p>
          <div className="grid gap-2 min-[420px]:grid-cols-2 lg:grid-cols-1">
            <Button asChild><Link href="/checker">Start checking <ArrowRight className="ml-2 size-4" /></Link></Button>
            <Button asChild variant="outline"><Link href="/docs/api">Read API docs</Link></Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card key={step.title} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="grid size-11 place-items-center rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-200"><Icon className="size-5" /></div>
                  <span className="text-xs font-black text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="font-bold">{step.title}</h3>
                <p className="mt-2 min-h-12 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                <Link href={step.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:underline">
                  <CheckCircle2 className="size-4" /> {step.action}
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

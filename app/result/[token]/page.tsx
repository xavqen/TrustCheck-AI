import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrustScoreMeter } from "@/components/checker/trust-score-meter";
import { riskBadgeVariant } from "@/lib/utils";

function jsonArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

export default async function SharedResultPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const check = await prisma.scamCheck.findUnique({ where: { shareToken: token } });
  if (!check) notFound();

  const Icon = check.riskLevel === "SAFE" ? CheckCircle2 : check.riskLevel === "SUSPICIOUS" ? AlertTriangle : ShieldAlert;
  const redFlags = jsonArray(check.redFlags);
  const reasons = jsonArray(check.reasons);

  return (
    <section className="container-px mx-auto max-w-4xl py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Public result card</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">TrustCheck AI analysis</h1>
          <p className="mt-2 text-muted-foreground">Generated on {format(check.createdAt, "PPP p")}. Sensitive input is not shown on public result pages.</p>
        </div>
        <Button asChild><Link href="/checker">Run your own check</Link></Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/40">
          <CardTitle className="flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-2"><Icon className="size-5" /> {check.type.replaceAll("_", " ")}</span>
            <Badge variant={riskBadgeVariant(check.riskLevel)}>{check.riskLevel}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-5 sm:p-7">
          <TrustScoreMeter score={check.trustScore} riskLevel={check.riskLevel} />
          <div>
            <div className="mb-2 flex justify-between text-sm"><span>Trust score progress</span><span className="font-semibold">{check.trustScore}/100</span></div>
            <Progress value={check.trustScore} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoBox title="Red flags" items={redFlags} />
            <InfoBox title="Reasons" items={reasons} />
          </div>

          <div className="rounded-2xl bg-muted p-4">
            <h2 className="font-semibold">Recommended action</h2>
            <p className="mt-2 text-sm text-muted-foreground">{check.recommendedAction}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <h2 className="font-semibold">Safe reply</h2>
            <p className="mt-2 text-sm text-muted-foreground">{check.safeReply}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <h2 className="font-semibold">Report guidance</h2>
            <p className="mt-2 text-sm text-muted-foreground">{check.reportGuidance}</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function InfoBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border p-4">
      <h2 className="font-semibold">{title}</h2>
      <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  );
}

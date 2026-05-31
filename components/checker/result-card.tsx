"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Copy, Download, Flag, Share2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { riskBadgeVariant } from "@/lib/utils";
import { TrustScoreMeter } from "@/components/checker/trust-score-meter";

export type CheckResult = {
  id: string;
  shareToken?: string | null;
  riskLevel: "SAFE" | "SUSPICIOUS" | "DANGEROUS";
  trustScore: number;
  redFlags: string[];
  reasons: string[];
  recommendedAction: string;
  safeReply: string;
  reportGuidance: string;
};

export function ResultCard({ result }: { result: CheckResult }) {
  const Icon = result.riskLevel === "SAFE" ? CheckCircle2 : result.riskLevel === "SUSPICIOUS" ? AlertTriangle : ShieldAlert;
  const shareUrl = typeof window !== "undefined" && result.shareToken ? `${window.location.origin}/result/${result.shareToken}` : "";

  const copySummary = async () => {
    await navigator.clipboard.writeText(`TrustCheck AI result: ${result.riskLevel}, score ${result.trustScore}/100. ${result.recommendedAction}${shareUrl ? ` ${shareUrl}` : ""}`);
    toast.success("Shareable result copied");
  };

  const shareResult = async () => {
    const text = `TrustCheck AI result: ${result.riskLevel}, trust score ${result.trustScore}/100.`;
    if (navigator.share && shareUrl) {
      await navigator.share({ title: "TrustCheck AI result", text, url: shareUrl });
      return;
    }
    await copySummary();
  };

  return (
    <Card className="h-fit overflow-hidden lg:sticky lg:top-28">
      <CardHeader className="bg-muted/40">
        <CardTitle className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2"><Icon className="size-5 shrink-0" /> Result</span>
          <Badge variant={riskBadgeVariant(result.riskLevel)}>{result.riskLevel}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-5 sm:p-6">
        <TrustScoreMeter score={result.trustScore} riskLevel={result.riskLevel} />
        <div>
          <div className="mb-2 flex justify-between text-sm"><span>Trust score progress</span><span className="font-semibold">{result.trustScore}/100</span></div>
          <Progress value={result.trustScore} />
        </div>

        <ResultSection title="Red flags" items={result.redFlags} />
        <ResultSection title="Reason" items={result.reasons} />

        <div className="rounded-2xl bg-muted p-4"><h3 className="font-semibold">Recommended action</h3><p className="mt-2 break-anywhere text-sm leading-6 text-muted-foreground">{result.recommendedAction}</p></div>
        <div className="rounded-2xl border p-4"><h3 className="font-semibold">Safe reply suggestion</h3><p className="mt-2 break-anywhere text-sm leading-6 text-muted-foreground">{result.safeReply}</p></div>
        <div className="rounded-2xl border p-4"><h3 className="font-semibold">Report guidance</h3><p className="mt-2 break-anywhere text-sm leading-6 text-muted-foreground">{result.reportGuidance}</p></div>

        <div className="grid gap-2 min-[420px]:grid-cols-2 sm:grid-cols-4">
          <Button variant="outline" onClick={copySummary}><Copy className="mr-2 size-4" /> Copy</Button>
          <Button variant="outline" onClick={shareResult}><Share2 className="mr-2 size-4" /> Share</Button>
          <Button asChild variant="outline"><Link href={`/report?checkId=${result.id}`}><Flag className="mr-2 size-4" /> Report</Link></Button>
          <Button asChild variant="outline"><Link href={`/api/check/${result.id}/download`}><Download className="mr-2 size-4" /> Download</Link></Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
        {items.map((item) => <li key={item} className="break-anywhere leading-relaxed">• {item}</li>)}
      </ul>
    </div>
  );
}

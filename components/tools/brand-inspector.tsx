"use client";

import { useState } from "react";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

type BrandResult = {
  suspectedBrands: string[];
  matchedOfficialDomain: boolean;
  suspiciousDomainHints: string[];
  riskScore: number;
  recommendation: string;
};

const sample = "SBI KYC expired. Your YONO account will be blocked today. Verify now: https://sbi-kyc-secure-login.example.com";

export function BrandInspector() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BrandResult | null>(null);

  async function inspect() {
    setLoading(true);
    setResult(null);
    const response = await fetch("/api/brand/inspect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      toast.error(data.error || "Brand inspection failed");
      return;
    }
    setResult(data);
  }

  const variant: "outline" | "danger" | "warning" | "safe" = !result ? "outline" : result.riskScore >= 60 ? "danger" : result.riskScore >= 30 ? "warning" : "safe";

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader><CardTitle>Paste suspicious brand message or URL</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Paste a message claiming to be from a bank, wallet, shopping app, courier, social network or subscription brand..." />
          <div className="responsive-actions">
            <Button onClick={inspect} disabled={loading || input.trim().length < 4} className="w-full sm:w-auto">
              {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Inspecting</> : "Inspect brand risk"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setInput(sample)} className="w-full sm:w-auto">Try sample</Button>
          </div>
          <p className="text-xs text-muted-foreground">Checks for brand-name abuse, suspicious domains, KYC/refund pressure, and official-domain mismatch.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {result?.riskScore && result.riskScore >= 40 ? <ShieldAlert className="size-5 text-red-600" /> : <ShieldCheck className="size-5 text-emerald-600" />}
            Brand impersonation result
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result ? (
            <p className="text-sm text-muted-foreground">Result will show suspected brand, domain mismatch, risk score and safe action.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge variant={variant}>{result.riskScore >= 60 ? "High risk" : result.riskScore >= 30 ? "Needs verification" : "Low brand risk"}</Badge>
                <span className="text-sm font-semibold">{result.riskScore}/100</span>
              </div>
              <Progress value={result.riskScore} />
              <div>
                <p className="text-sm font-semibold">Suspected brands</p>
                <p className="mt-1 break-anywhere text-sm leading-6 text-muted-foreground">{result.suspectedBrands.length ? result.suspectedBrands.join(", ") : "No watched brand detected"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Domain status</p>
                <p className="mt-1 break-anywhere text-sm leading-6 text-muted-foreground">{result.matchedOfficialDomain ? "An official domain was detected." : "No official watched-domain match was found."}</p>
              </div>
              {result.suspiciousDomainHints.length ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                  <p className="font-semibold">Suspicious domain hints</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {result.suspiciousDomainHints.map((hint) => <li key={hint}>{hint}</li>)}
                  </ul>
                </div>
              ) : null}
              <div className="break-anywhere rounded-2xl bg-muted p-4 text-sm leading-6">{result.recommendation}</div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Loader2, SearchCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type UrlSignal = { label: string; severity: number; detail: string };
type InspectResult = { urls: string[]; verdict: "DANGEROUS" | "SUSPICIOUS" | "LOW_SIGNAL"; signalCount: number; totalSeverity: number; signals: UrlSignal[]; normalizedInput?: string };

function variant(verdict: InspectResult["verdict"]) {
  if (verdict === "DANGEROUS") return "danger" as const;
  if (verdict === "SUSPICIOUS") return "warning" as const;
  return "safe" as const;
}

export function UrlInspector() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InspectResult | null>(null);

  async function inspect() {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/url/inspect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Inspection failed");
      setResult(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Inspection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><SearchCheck className="size-5" /> URL signal inspector</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url-text">Paste URL or message containing a URL</Label>
            <Textarea id="url-text" value={text} onChange={(event) => setText(event.target.value)} placeholder="https://support-bank-verify.example/kyc" />
          </div>
          <Button onClick={inspect} disabled={loading || text.trim().length < 4} className="w-full">
            {loading ? <><Loader2 className="mr-2 size-4 animate-spin" /> Inspecting</> : "Inspect URL signals"}
          </Button>
          <p className="text-xs text-muted-foreground">This tool checks visible URL signals only. Use the full checker for message context and AI reasoning.</p>
        </CardContent>
      </Card>

      {result ? (
        <Card>
          <CardHeader><CardTitle className="flex flex-wrap items-center justify-between gap-3"><span>Inspection result</span><Badge variant={variant(result.verdict)}>{result.verdict.toLowerCase()}</Badge></CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border p-4"><p className="text-2xl font-bold">{result.urls.length}</p><p className="text-xs text-muted-foreground">URLs found</p></div>
              <div className="rounded-2xl border p-4"><p className="text-2xl font-bold">{result.signalCount}</p><p className="text-xs text-muted-foreground">signals</p></div>
              <div className="rounded-2xl border p-4"><p className="text-2xl font-bold">{result.totalSeverity}</p><p className="text-xs text-muted-foreground">severity</p></div>
            </div>
            <div className="space-y-3">
              {result.signals.length ? result.signals.map((signal) => (
                <div key={`${signal.label}-${signal.detail}`} className="rounded-2xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3"><span className="font-medium">{signal.label}</span><Badge variant="outline">+{signal.severity}</Badge></div>
                  <p className="mt-2 break-anywhere text-sm leading-6 text-muted-foreground">{signal.detail}</p>
                </div>
              )) : <p className="rounded-2xl border p-4 text-sm text-muted-foreground">No strong URL-only scam signal found. Still verify the sender and official domain.</p>}
            </div>
          </CardContent>
        </Card>
      ) : <Card><CardContent className="p-8 text-center text-muted-foreground">URL-only risk signals will appear here.</CardContent></Card>}
    </div>
  );
}

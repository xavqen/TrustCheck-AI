"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardPaste, Loader2, LockKeyhole, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { checkInputSchema } from "@/lib/validation";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ResultCard, type CheckResult } from "@/components/checker/result-card";

type FormValues = z.infer<typeof checkInputSchema>;

const examples: Record<FormValues["type"], string> = {
  URL: "https://paytm-support-verify.example.com/kyc?urgent=1",
  WHATSAPP: "Your bank account will be blocked in 30 minutes. Click this link and submit OTP to verify KYC.",
  EMAIL: "Dear user, your mailbox will be suspended. Confirm password and recovery code immediately.",
  JOB_OFFER: "Work from home job. Earn ₹5000 daily. Pay ₹999 registration fee to HR on Telegram.",
  LOAN_OFFER: "Your instant loan is approved. Pay processing fee first to release money.",
  CRYPTO_INVESTMENT: "Guaranteed 15% daily profit. Send USDT to activate trading bot.",
  SHOPPING_SELLER: "Luxury phone at 90% discount. Pay advance now, no COD available.",
  QR_TEXT: "upi://pay?pa=random@upi&am=4999&tn=account verification fee",
  SCREENSHOT_TEXT: "Police cyber cell notice: pay fine today or account will be frozen. Contact WhatsApp number now.",
  OTHER: "You won a prize. Share Aadhaar, PAN, bank details and OTP to claim reward."
};

const types = [
  ["URL", "Suspicious URL"],
  ["WHATSAPP", "WhatsApp message"],
  ["EMAIL", "Email text"],
  ["JOB_OFFER", "Job offer"],
  ["LOAN_OFFER", "Loan offer"],
  ["CRYPTO_INVESTMENT", "Crypto/investment offer"],
  ["SHOPPING_SELLER", "Shopping seller"],
  ["QR_TEXT", "QR code text"],
  ["SCREENSHOT_TEXT", "Screenshot OCR text"],
  ["OTHER", "Other suspicious text"]
];

const quickSamples: Array<{ label: string; type: FormValues["type"] }> = [
  { label: "Fake KYC", type: "WHATSAPP" },
  { label: "Job fee", type: "JOB_OFFER" },
  { label: "Crypto profit", type: "CRYPTO_INVESTMENT" },
  { label: "QR payment", type: "QR_TEXT" }
];

export function ScamCheckerForm() {
  const [result, setResult] = useState<CheckResult | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(checkInputSchema), defaultValues: { type: "URL", input: "" } });
  const inputValue = form.watch("input") || "";
  const currentType = form.watch("type");

  const stats = useMemo(() => {
    const words = inputValue.trim() ? inputValue.trim().split(/\s+/).length : 0;
    return { chars: inputValue.length, words };
  }, [inputValue]);

  const fillSample = (type = currentType) => {
    form.setValue("type", type, { shouldValidate: true });
    form.setValue("input", examples[type], { shouldValidate: true });
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.error("Clipboard is empty");
        return;
      }
      form.setValue("input", text.slice(0, 6000), { shouldValidate: true });
      toast.success("Pasted from clipboard");
    } catch {
      toast.error("Clipboard permission blocked");
    }
  };

  const onSubmit = async (values: FormValues) => {
    setResult(null);
    const response = await fetch("/api/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error || "Check failed");
      return;
    }
    setResult(data);
    toast.success("Analysis complete");
  };

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[0.95fr_1.05fr] xl:items-start">
      <div className="min-w-0 space-y-4 xl:sticky xl:top-28">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
              <CardTitle>Paste content</CardTitle>
              <Badge variant="secondary" className="w-fit">Private analysis</Badge>
            </div>
            <div className="grid gap-2 min-[420px]:grid-cols-3">
              <div className="rounded-2xl border bg-muted/40 px-3 py-2 text-xs text-muted-foreground"><span className="font-bold text-foreground">{stats.chars}</span> chars</div>
              <div className="rounded-2xl border bg-muted/40 px-3 py-2 text-xs text-muted-foreground"><span className="font-bold text-foreground">{stats.words}</span> words</div>
              <div className="rounded-2xl border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">Max <span className="font-bold text-foreground">6000</span></div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="type">Check type</Label>
                <Select id="type" {...form.register("type")}>{types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
              </div>
              <div className="space-y-2">
                <div className="flex flex-col gap-2 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between">
                  <Label htmlFor="input">Suspicious content</Label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fillSample()}
                      className="inline-flex min-h-8 items-center gap-1 rounded-full border px-3 py-1 text-xs text-muted-foreground transition hover:bg-muted"
                    >
                      <Wand2 className="size-3" /> Try sample
                    </button>
                    <button
                      type="button"
                      onClick={pasteFromClipboard}
                      className="inline-flex min-h-8 items-center gap-1 rounded-full border px-3 py-1 text-xs text-muted-foreground transition hover:bg-muted"
                    >
                      <ClipboardPaste className="size-3" /> Paste
                    </button>
                  </div>
                </div>
                <Textarea id="input" placeholder="Paste link, WhatsApp message, email, QR text, job offer, loan message or screenshot OCR text..." {...form.register("input")} />
                {form.formState.errors.input ? <p className="text-sm text-red-600">{form.formState.errors.input.message}</p> : <p className="flex items-start gap-2 text-xs text-muted-foreground"><LockKeyhole className="mt-0.5 size-3.5 shrink-0" /> Do not paste passwords, OTPs, CVV, private keys or highly sensitive personal data.</p>}
              </div>
              <Button disabled={form.formState.isSubmitting} className="w-full mobile-tap-target" size="lg">
                {form.formState.isSubmitting ? <><Loader2 className="mr-2 size-4 animate-spin" /> Analyzing</> : "Check scam risk"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card/70">
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-semibold">Fast test samples</p>
            <div className="grid gap-2 min-[420px]:grid-cols-2">
              {quickSamples.map((sample) => (
                <button key={sample.type} type="button" onClick={() => fillSample(sample.type)} className="min-h-11 rounded-2xl border px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground">
                  {sample.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {result ? <ResultCard result={result} /> : (
        <Card className="h-fit overflow-hidden xl:sticky xl:top-28">
          <CardContent className="space-y-4 p-6 text-center text-muted-foreground sm:p-8">
            <div className="mx-auto grid size-14 place-items-center rounded-3xl bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-200">
              <Wand2 className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Result will appear here</h2>
              <p className="mt-2 text-sm leading-relaxed">You will get risk level, trust score, red flags, reason, safe reply, report guidance and download/share actions.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

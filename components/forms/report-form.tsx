"use client";

import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { reportSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const scamTypes = ["Phishing", "Fake job", "Crypto/investment", "Loan scam", "Shopping fraud", "Romance scam", "Delivery scam", "Fake refund"];

type FormValues = z.infer<typeof reportSchema>;

export function ReportForm({ checkId }: { checkId?: string }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: { checkId, scamType: "", platform: "", country: "", description: "", screenshotUrl: "", isPublic: false }
  });

  const onSubmit = async (values: FormValues) => {
    const response = await fetch("/api/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const data = await response.json();
    if (!response.ok) return toast.error(data.error || "Could not submit report");
    toast.success(values.isPublic ? "Report submitted for anonymous public review" : "Private report saved");
    form.reset({ checkId, scamType: "", platform: "", country: "", description: "", screenshotUrl: "", isPublic: false });
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {checkId ? <input type="hidden" {...form.register("checkId")} /> : null}
          <div className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
            {checkId ? "This report will be linked to the scam check you just ran." : "Share only useful evidence. Never submit OTPs, passwords, private keys, CVV, full identity documents, or private account details."}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar sm:flex-wrap">
            {scamTypes.map((type) => (
              <button key={type} type="button" onClick={() => form.setValue("scamType", type, { shouldValidate: true })} className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:bg-muted">
                {type}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Scam type" error={form.formState.errors.scamType?.message}><Input {...form.register("scamType")} placeholder="Phishing, fake job, crypto..." /></Field>
            <Field label="Platform" error={form.formState.errors.platform?.message}><Input {...form.register("platform")} placeholder="WhatsApp, email, Instagram..." /></Field>
          </div>
          <Field label="Country" error={form.formState.errors.country?.message}><Input {...form.register("country")} placeholder="India, USA, UK..." /></Field>
          <Field label="Description" error={form.formState.errors.description?.message}><Textarea {...form.register("description")} placeholder="Describe what happened, sender details, links, amount, timeline..." className="min-h-32" /></Field>
          <Field label="Screenshot URL" error={form.formState.errors.screenshotUrl?.message}><Input {...form.register("screenshotUrl")} placeholder="https://..." /></Field>

          <label className="flex items-start gap-3 rounded-2xl border bg-card p-4 text-sm leading-6">
            <input type="checkbox" {...form.register("isPublic")} className="mt-1 size-4 rounded border-border" />
            <span>
              <span className="font-semibold text-foreground">Share this anonymously in the public scam database</span>
              <span className="block text-muted-foreground">Only scam type, platform, country, date, and sanitized description can become public after admin review. Your account, email, screenshot URL, and linked check stay private.</span>
            </span>
          </label>

          <Button disabled={form.formState.isSubmitting} className="w-full">Submit report</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error ? <p className="text-sm text-red-600">{error}</p> : null}</div>;
}

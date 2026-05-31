"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { alertSubscriptionSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const scamTypeOptions = ["Phishing", "Fake job", "Loan scam", "Crypto", "Shopping fraud", "KYC", "Delivery", "Romance"];

type FormValues = z.infer<typeof alertSubscriptionSchema>;

export function AlertSubscribeForm({ source = "alerts" }: { source?: string }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(alertSubscriptionSchema),
    defaultValues: { email: "", country: "", scamTypes: [], frequency: "weekly", source }
  });

  const selected = form.watch("scamTypes") || [];
  const selectedText = useMemo(() => selected.length ? selected.join(", ") : "All major scam types", [selected]);

  const toggleType = (type: string) => {
    const current = form.getValues("scamTypes") || [];
    form.setValue("scamTypes", current.includes(type) ? current.filter((item) => item !== type) : [...current, type], { shouldValidate: true });
  };

  const onSubmit = async (values: FormValues) => {
    const response = await fetch("/api/alerts/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const data = await response.json();
    if (!response.ok) return toast.error(data.error || "Could not save alert subscription");
    toast.success(data.updated ? "Alert preferences updated" : "Alert subscription saved");
    form.reset({ email: values.email, country: values.country || "", scamTypes: values.scamTypes || [], frequency: values.frequency, source });
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
            Get scam pattern alerts for <span className="font-semibold text-foreground">{selectedText}</span>. No private check content is emailed.
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" error={form.formState.errors.email?.message}>
              <Input type="email" placeholder="you@example.com" {...form.register("email")} />
            </Field>
            <Field label="Country focus" error={form.formState.errors.country?.message}>
              <Input placeholder="India, USA, UK..." {...form.register("country")} />
            </Field>
          </div>

          <Field label="Frequency" error={form.formState.errors.frequency?.message}>
            <Select {...form.register("frequency")}>
              <option value="weekly">Weekly digest</option>
              <option value="daily">Daily alerts</option>
              <option value="critical_only">Critical only</option>
            </Select>
          </Field>

          <div className="space-y-2">
            <Label>Scam types</Label>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar sm:flex-wrap">
              {scamTypeOptions.map((type) => {
                const active = selected.includes(type);
                return (
                  <button key={type} type="button" onClick={() => toggleType(type)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? "border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-200" : "hover:bg-muted"}`}>
                    {type}
                  </button>
                );
              })}
            </div>
            <Badge variant="outline">Leave all unselected to receive broad scam alerts</Badge>
          </div>

          <Button disabled={form.formState.isSubmitting} className="w-full">Subscribe to alerts</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error ? <p className="text-sm text-red-600">{error}</p> : null}</div>;
}

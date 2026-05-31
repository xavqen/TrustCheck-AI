"use client";

import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { integrationLeadSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormValues = z.infer<typeof integrationLeadSchema>;

export function IntegrationLeadForm({ source = "website", cta = "Request access" }: { source?: string; cta?: string }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(integrationLeadSchema),
    defaultValues: { name: "", email: "", company: "", useCase: "", volume: "", source }
  });

  const onSubmit = async (values: FormValues) => {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, source })
    });
    const data = await response.json();
    if (!response.ok) return toast.error(data.error || "Could not save request");
    toast.success("Request saved. Admin can review it from the leads dashboard.");
    form.reset({ name: "", email: "", company: "", useCase: "", volume: "", source });
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" error={form.formState.errors.name?.message}><Input {...form.register("name")} placeholder="Your name" /></Field>
            <Field label="Email" error={form.formState.errors.email?.message}><Input type="email" {...form.register("email")} placeholder="you@company.com" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company / project" error={form.formState.errors.company?.message}><Input {...form.register("company")} placeholder="Company name" /></Field>
            <Field label="Expected volume" error={form.formState.errors.volume?.message}><Input {...form.register("volume")} placeholder="100 checks/day, 5k/month..." /></Field>
          </div>
          <Field label="Use case" error={form.formState.errors.useCase?.message}>
            <Textarea {...form.register("useCase")} className="min-h-32" placeholder="Example: I want to check marketplace seller links before users open them." />
          </Field>
          <Button disabled={form.formState.isSubmitting} className="w-full">{cta}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error ? <p className="text-sm text-red-600">{error}</p> : null}</div>;
}

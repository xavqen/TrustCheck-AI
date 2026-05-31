"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PLAN_CONFIG } from "@/lib/plan-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const paidPlans = ["PRO", "FAMILY", "BUSINESS"] as const;

type PaidPlan = (typeof paidPlans)[number];

type Props = {
  defaultName: string;
  defaultEmail: string;
  defaultPlan: PaidPlan;
};

export function PlanRequestForm({ defaultName, defaultEmail, defaultPlan }: Props) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [company, setCompany] = useState("");
  const [plan, setPlan] = useState<PaidPlan>(defaultPlan);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedPlan = useMemo(() => PLAN_CONFIG[plan], [plan]);

  const submit = async () => {
    setLoading(true);
    const response = await fetch("/api/billing/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, company, plan, message })
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      toast.error(data.error || "Could not submit upgrade request");
      return;
    }
    setSubmitted(true);
    toast.success("Upgrade request submitted");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual upgrade request</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {submitted ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
            <p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="size-4" /> Request received</p>
            <p className="mt-2">Admin can approve it from the billing dashboard. Use this only if online payment is not possible.</p>
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="billing-name">Name</Label>
            <Input id="billing-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing-email">Email</Label>
            <Input id="billing-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="billing-plan">Plan</Label>
            <Select id="billing-plan" value={plan} onChange={(event) => setPlan(event.target.value as PaidPlan)}>
              {paidPlans.map((item) => <option key={item} value={item}>{PLAN_CONFIG[item].name} · {PLAN_CONFIG[item].price}</option>)}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing-company">Company / team</Label>
            <Input id="billing-company" value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Optional" />
          </div>
        </div>
        <div className="rounded-2xl border bg-muted/40 p-4">
          <p className="font-semibold">{selectedPlan.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{selectedPlan.description}</p>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {selectedPlan.features.map((feature) => <li key={feature} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />{feature}</li>)}
          </ul>
        </div>
        <div className="space-y-2">
          <Label htmlFor="billing-message">Message</Label>
          <Textarea id="billing-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us what you need. Optional." />
        </div>
        <Button onClick={submit} disabled={loading || submitted} className="w-full sm:w-auto">
          {loading ? <><Loader2 className="mr-2 size-4 animate-spin" /> Sending</> : submitted ? "Request submitted" : "Submit manual request"}
        </Button>
      </CardContent>
    </Card>
  );
}

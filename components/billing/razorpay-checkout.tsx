"use client";

import { useMemo, useState } from "react";
import { CreditCard, Loader2, RefreshCw, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import { PLAN_CONFIG } from "@/lib/plan-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type PaidPlan = "PRO" | "FAMILY" | "BUSINESS";
type PaymentMode = "subscription" | "one_time";

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  name: string;
  description: string;
  image?: string;
  amount?: number;
  currency?: string;
  order_id?: string;
  subscription_id?: string;
  prefill?: { name?: string; email?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void; on: (event: string, callback: (response: unknown) => void) => void };
  }
}

const paidPlans: PaidPlan[] = ["PRO", "FAMILY", "BUSINESS"];

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpayCheckout({ defaultPlan, defaultName, defaultEmail }: { defaultPlan: PaidPlan; defaultName: string; defaultEmail: string }) {
  const [plan, setPlan] = useState<PaidPlan>(defaultPlan);
  const [mode, setMode] = useState<PaymentMode>("subscription");
  const [loading, setLoading] = useState(false);
  const selectedPlan = useMemo(() => PLAN_CONFIG[plan], [plan]);

  async function startCheckout() {
    setLoading(true);
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      setLoading(false);
      toast.error("Could not load Razorpay Checkout. Check your network and try again.");
      return;
    }

    const endpoint = mode === "subscription" ? "/api/razorpay/subscription" : "/api/razorpay/order";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan })
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setLoading(false);
      toast.error(data.error || "Could not start Razorpay checkout.");
      return;
    }

    const options: RazorpayOptions = {
      key: data.keyId,
      name: "TrustCheck AI",
      description: `${selectedPlan.name} ${mode === "subscription" ? "monthly autopay" : "30-day access"}`,
      image: "/icon.svg",
      prefill: { name: defaultName, email: defaultEmail },
      notes: { plan, mode },
      theme: { color: "#0f766e" },
      modal: {
        ondismiss: () => {
          setLoading(false);
          toast.message("Checkout closed.");
        }
      },
      handler: async (payment: RazorpayResponse) => {
        const verifyEndpoint = mode === "subscription" ? "/api/razorpay/subscription/verify" : "/api/razorpay/order/verify";
        const verifyPayload = mode === "subscription"
          ? {
              razorpay_subscription_id: payment.razorpay_subscription_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature
            }
          : {
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature
            };

        const verifyResponse = await fetch(verifyEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(verifyPayload)
        });
        const verifyData = await verifyResponse.json().catch(() => ({}));
        setLoading(false);

        if (!verifyResponse.ok) {
          toast.error(verifyData.error || "Payment verification failed.");
          return;
        }

        toast.success(mode === "subscription" ? "Autopay activated successfully." : "Payment successful. Plan activated.");
        window.location.href = "/billing?payment=success";
      }
    };

    if (mode === "subscription") {
      options.subscription_id = data.subscriptionId;
    } else {
      options.order_id = data.orderId;
      options.amount = data.amount;
      options.currency = data.currency;
    }

    const checkout = new window.Razorpay(options);
    checkout.on("payment.failed", (failure) => {
      setLoading(false);
      console.error("Razorpay payment failed", failure);
      toast.error("Payment failed or was cancelled.");
    });
    checkout.open();
  }

  return (
    <Card className="border-primary/20 shadow-glow">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><CreditCard className="size-5" /> Razorpay payments</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">Activate paid plans instantly with Razorpay Checkout. Use autopay for monthly recurring billing.</p>
          </div>
          <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">Autopay ready</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rzp-plan">Plan</Label>
            <Select id="rzp-plan" value={plan} onChange={(event) => setPlan(event.target.value as PaidPlan)}>
              {paidPlans.map((item) => <option key={item} value={item}>{PLAN_CONFIG[item].name} · {PLAN_CONFIG[item].price}</option>)}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rzp-mode">Billing mode</Label>
            <Select id="rzp-mode" value={mode} onChange={(event) => setMode(event.target.value as PaymentMode)}>
              <option value="subscription">Monthly autopay subscription</option>
              <option value="one_time">One-time 30-day payment</option>
            </Select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-muted-foreground">Selected</p>
            <p className="mt-1 font-semibold">{selectedPlan.name}</p>
            <p className="text-sm text-muted-foreground">{selectedPlan.price}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-muted-foreground">Billing</p>
            <p className="mt-1 flex items-center gap-2 font-semibold">{mode === "subscription" ? <RefreshCw className="size-4" /> : <Zap className="size-4" />} {mode === "subscription" ? "Autopay" : "One-time"}</p>
            <p className="text-sm text-muted-foreground">{mode === "subscription" ? "Renews monthly" : "30 days access"}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-muted-foreground">Activation</p>
            <p className="mt-1 flex items-center gap-2 font-semibold"><ShieldCheck className="size-4" /> Instant</p>
            <p className="text-sm text-muted-foreground">After verified payment</p>
          </div>
        </div>

        <Button onClick={startCheckout} disabled={loading} className="w-full sm:w-auto">
          {loading ? <><Loader2 className="mr-2 size-4 animate-spin" /> Opening Razorpay</> : mode === "subscription" ? "Start autopay with Razorpay" : "Pay once with Razorpay"}
        </Button>
      </CardContent>
    </Card>
  );
}

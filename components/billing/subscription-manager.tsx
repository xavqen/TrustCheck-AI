"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Loader2, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SubscriptionSummary = {
  id: string;
  plan: string;
  status: string;
  providerStatus: string | null;
  providerSubscriptionId: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  nextBillingAt: string | null;
  cancellationRequestedAt: string | null;
  lastSyncedAt: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function SubscriptionManager({ subscription }: { subscription: SubscriptionSummary | null }) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<"cancel" | "sync" | null>(null);

  async function callEndpoint(endpoint: string, action: "cancel" | "sync", body?: Record<string, unknown>) {
    setLoadingAction(action);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json().catch(() => ({}));
    setLoadingAction(null);

    if (!response.ok) {
      toast.error(data.error || "Billing action failed.");
      return;
    }

    toast.success(action === "cancel" ? "Autopay cancellation request saved." : "Subscription status synced.");
    router.refresh();
  }

  if (!subscription?.providerSubscriptionId) {
    return (
      <Card>
        <CardHeader><CardTitle>Autopay management</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No Razorpay autopay subscription is linked yet. Start monthly autopay below to enable automatic renewals.</p>
        </CardContent>
      </Card>
    );
  }

  const canCancel = ["active", "authenticated", "pending"].includes(subscription.status) && !subscription.cancelAtPeriodEnd;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Autopay management</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">Cancel renewal, sync Razorpay status, and track your next billing date.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={subscription.status === "active" ? "safe" : subscription.status === "pending" ? "warning" : "outline"}>{subscription.status}</Badge>
            {subscription.cancelAtPeriodEnd ? <Badge variant="warning">cancels at period end</Badge> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 min-[520px]:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border p-4">
            <p className="text-xs text-muted-foreground">Plan</p>
            <p className="mt-1 font-semibold">{subscription.plan}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-xs text-muted-foreground">Next billing</p>
            <p className="mt-1 text-sm font-semibold">{formatDate(subscription.nextBillingAt || subscription.currentPeriodEnd)}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-xs text-muted-foreground">Razorpay status</p>
            <p className="mt-1 font-semibold">{subscription.providerStatus || "—"}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-xs text-muted-foreground">Last synced</p>
            <p className="mt-1 text-sm font-semibold">{formatDate(subscription.lastSyncedAt)}</p>
          </div>
        </div>

        {subscription.cancelAtPeriodEnd ? (
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>Autopay is marked to stop at period end. Access should remain active until {formatDate(subscription.currentPeriodEnd)}.</p>
          </div>
        ) : null}

        <div className="responsive-actions">
          <Button variant="outline" onClick={() => callEndpoint("/api/billing/subscription/sync", "sync")} disabled={Boolean(loadingAction)} className="w-full sm:w-auto">
            {loadingAction === "sync" ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />}
            Sync status
          </Button>
          <Button variant="destructive" onClick={() => callEndpoint("/api/billing/subscription/cancel", "cancel", { immediate: false })} disabled={!canCancel || Boolean(loadingAction)} className="w-full sm:w-auto">
            {loadingAction === "cancel" ? <Loader2 className="mr-2 size-4 animate-spin" /> : <XCircle className="mr-2 size-4" />}
            Cancel next renewal
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">For refunds or immediate termination, contact support/admin. Customer-facing cancel here defaults to safer period-end cancellation.</p>
      </CardContent>
    </Card>
  );
}

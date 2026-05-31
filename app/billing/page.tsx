import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, CreditCard, Gauge, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { getActiveSubscription, getPlanConfig, PLAN_CONFIG } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { PlanRequestForm } from "@/components/billing/plan-request-form";
import { RazorpayCheckout } from "@/components/billing/razorpay-checkout";
import { SubscriptionManager } from "@/components/billing/subscription-manager";
import { BillingInvoiceList } from "@/components/billing/invoice-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type BillingPageProps = {
  searchParams: Promise<{ plan?: string }>;
};

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function normalizePlan(plan?: string): "PRO" | "FAMILY" | "BUSINESS" {
  if (plan === "FAMILY" || plan === "BUSINESS" || plan === "PRO") return plan;
  return "PRO";
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const subscription = await getActiveSubscription(session.user.id);
  const plan = subscription?.plan || "FREE";
  const config = getPlanConfig(plan);
  const today = startOfToday();

  const [usedToday, apiUsedToday, pendingRequest, razorpaySubscription, invoices] = await Promise.all([
    prisma.scamCheck.count({ where: { userId: session.user.id, createdAt: { gte: today } } }),
    prisma.apiUsage.findFirst({ where: { userId: session.user.id, route: "/api/v1/check", day: today } }),
    prisma.billingRequest.findFirst({ where: { userId: session.user.id, status: "PENDING" }, orderBy: { createdAt: "desc" } }),
    prisma.subscription.findFirst({
      where: { userId: session.user.id, provider: "RAZORPAY", providerSubscriptionId: { not: null } },
      orderBy: { startedAt: "desc" },
      select: {
        id: true,
        plan: true,
        status: true,
        providerStatus: true,
        providerSubscriptionId: true,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: true,
        nextBillingAt: true,
        cancellationRequestedAt: true,
        lastSyncedAt: true
      }
    }),
    prisma.billingInvoice.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 20 })
  ]);

  const dailyLimit = config.dailyCheckLimit;
  const usagePercent = dailyLimit ? Math.min(100, Math.round((usedToday / dailyLimit) * 100)) : 100;
  const defaultPlan = normalizePlan(params.plan);

  return (
    <section className="container-px mx-auto max-w-6xl py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold text-muted-foreground"><CreditCard className="size-3" /> Billing and limits</p>
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Pay with Razorpay, start monthly autopay, track daily limits, and manage manual upgrade requests.</p>
        </div>
        <Badge variant={plan === "FREE" ? "warning" : "safe"}>{config.name} plan</Badge>
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><Gauge className="size-5" /> Current usage</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 min-[520px]:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border p-4">
                <p className="text-sm text-muted-foreground">Checks today</p>
                <p className="mt-2 text-3xl font-bold">{usedToday}</p>
                <p className="mt-1 text-xs text-muted-foreground">{dailyLimit ? `${dailyLimit - usedToday > 0 ? dailyLimit - usedToday : 0} left today` : "Unlimited on this plan"}</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-sm text-muted-foreground">API calls today</p>
                <p className="mt-2 text-3xl font-bold">{apiUsedToday?.count || 0}</p>
                <p className="mt-1 text-xs text-muted-foreground">Business API only</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-sm text-muted-foreground">API access</p>
                <p className="mt-2 text-3xl font-bold">{config.apiAccess ? "On" : "Off"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{config.apiKeys} active-key limit</p>
              </div>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm"><span>Daily check limit</span><span>{dailyLimit ? `${usedToday}/${dailyLimit}` : "Unlimited"}</span></div>
              <Progress value={usagePercent} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-5" /> Active plan</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-2xl font-bold">{config.name}</p>
            <p className="text-sm text-muted-foreground">{config.description}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {config.features.map((feature) => <li key={feature} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />{feature}</li>)}
            </ul>
            <Button asChild variant="outline" className="w-full"><Link href="/settings">Open settings</Link></Button>
          </CardContent>
        </Card>
      </div>

      {pendingRequest ? (
        <div className="mt-6 rounded-3xl border border-amber-300 bg-amber-50 p-5 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="font-semibold">Pending upgrade request: {PLAN_CONFIG[pendingRequest.plan].name}</p>
          <p className="mt-1 text-sm">Submitted {pendingRequest.createdAt.toLocaleString()}. You can also pay instantly with Razorpay below.</p>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6">
        <RazorpayCheckout defaultName={session.user.name || ""} defaultEmail={session.user.email || ""} defaultPlan={defaultPlan} />
        <PlanRequestForm defaultName={session.user.name || ""} defaultEmail={session.user.email || ""} defaultPlan={defaultPlan} />
      </div>

      <div className="mt-6 grid gap-6">
        <SubscriptionManager subscription={razorpaySubscription ? {
          id: razorpaySubscription.id,
          plan: razorpaySubscription.plan,
          status: razorpaySubscription.status,
          providerStatus: razorpaySubscription.providerStatus,
          providerSubscriptionId: razorpaySubscription.providerSubscriptionId,
          cancelAtPeriodEnd: razorpaySubscription.cancelAtPeriodEnd,
          currentPeriodEnd: razorpaySubscription.currentPeriodEnd?.toISOString() || null,
          nextBillingAt: razorpaySubscription.nextBillingAt?.toISOString() || null,
          cancellationRequestedAt: razorpaySubscription.cancellationRequestedAt?.toISOString() || null,
          lastSyncedAt: razorpaySubscription.lastSyncedAt?.toISOString() || null
        } : null} />
        <BillingInvoiceList invoices={invoices} />
      </div>

    </section>
  );
}

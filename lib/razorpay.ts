import crypto from "node:crypto";
import type { BillingProvider, Plan, Prisma, Subscription } from "@prisma/client";
import { env } from "@/lib/env";
import { PLAN_CONFIG, type PlanId } from "@/lib/plan-config";
import { prisma } from "@/lib/prisma";

const RAZORPAY_API = "https://api.razorpay.com/v1";
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export type RazorpaySubscriptionStatus = {
  id: string;
  status: string;
  customer_id?: string | null;
  current_start?: number | null;
  current_end?: number | null;
  charge_at?: number | null;
  ended_at?: number | null;
  notes?: Record<string, unknown> | null;
};

export type RazorpayInvoiceStatus = {
  id: string;
  status?: string;
  amount?: number;
  currency?: string;
  receipt?: string | null;
  payment_id?: string | null;
  order_id?: string | null;
  subscription_id?: string | null;
  short_url?: string | null;
  pdf_url?: string | null;
  issued_at?: number | null;
  paid_at?: number | null;
  billing_start?: number | null;
  billing_end?: number | null;
  notes?: Record<string, unknown> | null;
};

export function isRazorpayConfigured() {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
}

export function getRazorpayKeyId() {
  if (!env.RAZORPAY_KEY_ID) throw new Error("RAZORPAY_KEY_ID is missing.");
  return env.RAZORPAY_KEY_ID;
}

function getRazorpaySecret() {
  if (!env.RAZORPAY_KEY_SECRET) throw new Error("RAZORPAY_KEY_SECRET is missing.");
  return env.RAZORPAY_KEY_SECRET;
}

function authHeader() {
  return `Basic ${Buffer.from(`${getRazorpayKeyId()}:${getRazorpaySecret()}`).toString("base64")}`;
}

export async function razorpayRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${RAZORPAY_API}${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      ...(init.headers || {})
    },
    cache: "no-store"
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.description || data?.error?.reason || data?.message || "Razorpay request failed.";
    throw new Error(message);
  }
  return data as T;
}

export function assertPaidPlan(plan: Plan | PlanId) {
  if (plan === "FREE") throw new Error("Free plan does not need payment.");
  const config = PLAN_CONFIG[plan as PlanId];
  if (!config || config.amountPaise <= 0) throw new Error("Invalid paid plan.");
  return config;
}

export function verifyHmac(message: string, signature: string, secret = getRazorpaySecret()) {
  const expected = crypto.createHmac("sha256", secret).update(message).digest("hex");
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function verifyOrderSignature(orderId: string, paymentId: string, signature: string) {
  return verifyHmac(`${orderId}|${paymentId}`, signature);
}

export function verifySubscriptionSignature(subscriptionId: string, paymentId: string, signature: string) {
  return verifyHmac(`${paymentId}|${subscriptionId}`, signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) throw new Error("RAZORPAY_WEBHOOK_SECRET is missing.");
  return verifyHmac(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET);
}

export function unixToDate(value?: number | null) {
  return value ? new Date(value * 1000) : null;
}

function normalizeRazorpaySubscriptionStatus(status?: string | null) {
  if (!status) return "active";
  if (["active", "authenticated"].includes(status)) return "active";
  if (["cancelled", "completed", "paused", "halted", "pending", "expired"].includes(status)) return status;
  return status;
}

export async function createRazorpayOrder(input: {
  userId: string;
  plan: Plan;
  name?: string | null;
  email?: string | null;
}) {
  const config = assertPaidPlan(input.plan);
  const receipt = `tc_${input.userId.slice(0, 10)}_${Date.now()}`.slice(0, 40);

  type OrderResponse = {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
  };

  const order = await razorpayRequest<OrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: config.amountPaise,
      currency: config.currency,
      receipt,
      notes: {
        app: "TrustCheck AI",
        userId: input.userId,
        plan: input.plan,
        billingMode: "one_time",
        name: input.name || "",
        email: input.email || ""
      }
    })
  });

  await prisma.paymentTransaction.create({
    data: {
      userId: input.userId,
      plan: input.plan,
      mode: "ONE_TIME",
      status: "CREATED",
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      razorpayOrderId: order.id,
      notes: { razorpayStatus: order.status }
    }
  });

  return order;
}

export async function ensureRazorpayPlan(plan: Plan) {
  const config = assertPaidPlan(plan);
  const existing = await prisma.razorpayPlan.findUnique({
    where: { plan_period_interval: { plan, period: "monthly", interval: 1 } }
  });
  if (existing) return existing;

  type PlanResponse = {
    id: string;
    item: { amount: number; currency: string };
    period: string;
    interval: number;
  };

  const created = await razorpayRequest<PlanResponse>("/plans", {
    method: "POST",
    body: JSON.stringify({
      period: "monthly",
      interval: 1,
      item: {
        name: `TrustCheck AI ${config.name}`,
        amount: config.amountPaise,
        currency: config.currency,
        description: config.description
      },
      notes: {
        app: "TrustCheck AI",
        plan
      }
    })
  });

  return prisma.razorpayPlan.create({
    data: {
      plan,
      providerPlanId: created.id,
      amount: created.item.amount,
      currency: created.item.currency,
      period: created.period,
      interval: created.interval
    }
  });
}

export async function createRazorpaySubscription(input: {
  userId: string;
  plan: Plan;
  name?: string | null;
  email?: string | null;
}) {
  const planRecord = await ensureRazorpayPlan(input.plan);
  const config = assertPaidPlan(input.plan);

  type SubscriptionResponse = {
    id: string;
    entity: string;
    plan_id: string;
    status: string;
    customer_id?: string | null;
    current_start?: number | null;
    current_end?: number | null;
  };

  const subscription = await razorpayRequest<SubscriptionResponse>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: planRecord.providerPlanId,
      total_count: 120,
      quantity: 1,
      customer_notify: 1,
      notes: {
        app: "TrustCheck AI",
        userId: input.userId,
        plan: input.plan,
        billingMode: "subscription",
        name: input.name || "",
        email: input.email || ""
      }
    })
  });

  await prisma.paymentTransaction.create({
    data: {
      userId: input.userId,
      plan: input.plan,
      mode: "SUBSCRIPTION",
      status: "CREATED",
      amount: config.amountPaise,
      currency: config.currency,
      razorpaySubscriptionId: subscription.id,
      notes: { razorpayStatus: subscription.status, providerPlanId: subscription.plan_id }
    }
  });

  return subscription;
}

export async function fetchRazorpaySubscription(providerSubscriptionId: string) {
  return razorpayRequest<RazorpaySubscriptionStatus>(`/subscriptions/${providerSubscriptionId}`, { method: "GET" });
}

export async function cancelRazorpaySubscription(providerSubscriptionId: string, cancelAtCycleEnd = true) {
  return razorpayRequest<RazorpaySubscriptionStatus>(`/subscriptions/${providerSubscriptionId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0 })
  });
}

export async function activatePlan(input: {
  userId: string;
  plan: Plan;
  provider: BillingProvider;
  providerSubscriptionId?: string | null;
  providerCustomerId?: string | null;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  providerStatus?: string | null;
  nextBillingAt?: Date | null;
  oneTimeDays?: number;
}) {
  const now = new Date();
  const endsAt = input.currentPeriodEnd || (input.oneTimeDays ? new Date(now.getTime() + input.oneTimeDays * 24 * 60 * 60 * 1000) : null);

  return prisma.$transaction(async (tx) => {
    if (input.providerSubscriptionId) {
      const existing = await tx.subscription.findUnique({ where: { providerSubscriptionId: input.providerSubscriptionId } });
      if (existing) {
        return tx.subscription.update({
          where: { id: existing.id },
          data: {
            plan: input.plan,
            status: "active",
            providerCustomerId: input.providerCustomerId || existing.providerCustomerId,
            providerStatus: input.providerStatus || existing.providerStatus,
            currentPeriodStart: input.currentPeriodStart || existing.currentPeriodStart || now,
            currentPeriodEnd: endsAt || existing.currentPeriodEnd,
            nextBillingAt: input.nextBillingAt || endsAt || existing.nextBillingAt,
            lastSyncedAt: now,
            endsAt: endsAt || existing.endsAt,
            cancelAtPeriodEnd: false,
            cancellationRequestedAt: null,
            cancelledAt: null,
            pausedAt: null
          }
        });
      }
    }

    await tx.subscription.updateMany({
      where: { userId: input.userId, status: "active" },
      data: { status: "replaced", endsAt: now }
    });

    return tx.subscription.create({
      data: {
        userId: input.userId,
        plan: input.plan,
        status: "active",
        provider: input.provider,
        providerSubscriptionId: input.providerSubscriptionId || null,
        providerCustomerId: input.providerCustomerId || null,
        providerStatus: input.providerStatus || null,
        currentPeriodStart: input.currentPeriodStart || now,
        currentPeriodEnd: endsAt,
        nextBillingAt: input.nextBillingAt || endsAt || (input.providerSubscriptionId ? new Date(now.getTime() + MONTH_MS) : null),
        lastSyncedAt: now,
        endsAt
      }
    });
  });
}

export async function syncLocalSubscriptionFromRazorpay(subscription: Pick<Subscription, "id" | "providerSubscriptionId">) {
  if (!subscription.providerSubscriptionId) throw new Error("This subscription is not linked to Razorpay.");
  const remote = await fetchRazorpaySubscription(subscription.providerSubscriptionId);
  const status = normalizeRazorpaySubscriptionStatus(remote.status);
  const currentEnd = unixToDate(remote.current_end);
  const endedAt = unixToDate(remote.ended_at);
  const now = new Date();

  return prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status,
      providerStatus: remote.status,
      providerCustomerId: remote.customer_id || undefined,
      currentPeriodStart: unixToDate(remote.current_start) || undefined,
      currentPeriodEnd: currentEnd || undefined,
      nextBillingAt: unixToDate(remote.charge_at) || currentEnd || undefined,
      endsAt: endedAt || (status === "cancelled" ? now : currentEnd || undefined),
      cancelledAt: status === "cancelled" ? endedAt || now : undefined,
      pausedAt: status === "paused" ? now : undefined,
      lastSyncedAt: now
    }
  });
}

export async function recordBillingInvoice(input: {
  userId: string;
  plan: Plan;
  providerInvoiceId?: string | null;
  providerPaymentId?: string | null;
  providerOrderId?: string | null;
  providerSubscriptionId?: string | null;
  status: string;
  amount: number;
  currency?: string | null;
  receipt?: string | null;
  shortUrl?: string | null;
  pdfUrl?: string | null;
  billingStart?: Date | null;
  billingEnd?: Date | null;
  issuedAt?: Date | null;
  paidAt?: Date | null;
}) {
  const subscription = input.providerSubscriptionId
    ? await prisma.subscription.findUnique({ where: { providerSubscriptionId: input.providerSubscriptionId }, select: { id: true } })
    : null;

  const data: Prisma.BillingInvoiceUncheckedCreateInput = {
    userId: input.userId,
    subscriptionId: subscription?.id || null,
    plan: input.plan,
    provider: "RAZORPAY",
    status: input.status,
    amount: input.amount,
    currency: input.currency || "INR",
    receipt: input.receipt || null,
    providerInvoiceId: input.providerInvoiceId || null,
    providerPaymentId: input.providerPaymentId || null,
    providerOrderId: input.providerOrderId || null,
    providerSubscriptionId: input.providerSubscriptionId || null,
    shortUrl: input.shortUrl || null,
    pdfUrl: input.pdfUrl || null,
    billingStart: input.billingStart || null,
    billingEnd: input.billingEnd || null,
    issuedAt: input.issuedAt || null,
    paidAt: input.paidAt || null
  };

  if (input.providerInvoiceId) {
    return prisma.billingInvoice.upsert({
      where: { providerInvoiceId: input.providerInvoiceId },
      create: data,
      update: {
        status: input.status,
        amount: input.amount,
        currency: input.currency || "INR",
        providerPaymentId: input.providerPaymentId || undefined,
        providerOrderId: input.providerOrderId || undefined,
        providerSubscriptionId: input.providerSubscriptionId || undefined,
        shortUrl: input.shortUrl || undefined,
        pdfUrl: input.pdfUrl || undefined,
        billingStart: input.billingStart || undefined,
        billingEnd: input.billingEnd || undefined,
        issuedAt: input.issuedAt || undefined,
        paidAt: input.paidAt || undefined,
        subscriptionId: subscription?.id || undefined
      }
    });
  }

  return prisma.billingInvoice.create({ data });
}

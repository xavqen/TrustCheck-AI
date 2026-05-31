import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { activatePlan, recordBillingInvoice, unixToDate, verifyWebhookSignature } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

type PaidPlan = "PRO" | "FAMILY" | "BUSINESS";

type RazorpaySubscriptionEntity = {
  id: string;
  status?: string;
  customer_id?: string | null;
  current_start?: number | null;
  current_end?: number | null;
  charge_at?: number | null;
  ended_at?: number | null;
  notes?: { userId?: string; plan?: PaidPlan } | Record<string, unknown>;
};

type RazorpayPaymentEntity = {
  id: string;
  order_id?: string | null;
  amount?: number;
  currency?: string;
  status?: string;
  error_description?: string | null;
  notes?: { userId?: string; plan?: PaidPlan } | Record<string, unknown>;
};

type RazorpayInvoiceEntity = {
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
  notes?: { userId?: string; plan?: PaidPlan } | Record<string, unknown>;
};

type RazorpayWebhookPayload = {
  event: string;
  payload?: {
    subscription?: { entity?: RazorpaySubscriptionEntity };
    payment?: { entity?: RazorpayPaymentEntity };
    invoice?: { entity?: RazorpayInvoiceEntity };
  };
};

function safeNotes(entity?: { notes?: Record<string, unknown> | null }) {
  return (entity?.notes || {}) as { userId?: string; plan?: PaidPlan };
}

function paymentStatusFromEvent(event: string, payment?: RazorpayPaymentEntity) {
  if (event === "payment.failed" || payment?.status === "failed") return "FAILED";
  if (event === "payment.authorized" || payment?.status === "authorized") return "AUTHORIZED";
  if (event === "payment.captured" || payment?.status === "captured") return "CAPTURED";
  return "CAPTURED";
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  const eventId = request.headers.get("x-razorpay-event-id") || `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  try {
    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook verification failed." }, { status: 500 });
  }

  const parsedPayload = JSON.parse(rawBody);
  const payload = parsedPayload as RazorpayWebhookPayload;
  const existing = await prisma.razorpayWebhookEvent.findUnique({ where: { eventId } });
  if (existing?.processedAt) return NextResponse.json({ ok: true, duplicate: true });

  await prisma.razorpayWebhookEvent.upsert({
    where: { eventId },
    create: { eventId, event: payload.event, payload: parsedPayload as Prisma.InputJsonValue },
    update: { payload: parsedPayload as Prisma.InputJsonValue, processingError: null }
  });

  try {
    const subscriptionEntity = payload.payload?.subscription?.entity;
    const paymentEntity = payload.payload?.payment?.entity;
    const invoiceEntity = payload.payload?.invoice?.entity;
    const subscriptionNotes = safeNotes(subscriptionEntity);
    const paymentNotes = safeNotes(paymentEntity);
    const invoiceNotes = safeNotes(invoiceEntity);

    const linkedTransaction = await prisma.paymentTransaction.findFirst({
      where: {
        OR: [
          paymentEntity?.id ? { razorpayPaymentId: paymentEntity.id } : { id: "__never__" },
          paymentEntity?.order_id ? { razorpayOrderId: paymentEntity.order_id } : { id: "__never__" },
          subscriptionEntity?.id ? { razorpaySubscriptionId: subscriptionEntity.id } : { id: "__never__" },
          invoiceEntity?.subscription_id ? { razorpaySubscriptionId: invoiceEntity.subscription_id } : { id: "__never__" }
        ]
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, userId: true, plan: true }
    });

    const linkedSubscription = subscriptionEntity?.id || invoiceEntity?.subscription_id
      ? await prisma.subscription.findUnique({
          where: { providerSubscriptionId: subscriptionEntity?.id || invoiceEntity?.subscription_id || "__never__" },
          select: { userId: true, plan: true, id: true }
        })
      : null;

    const userId = subscriptionNotes.userId || paymentNotes.userId || invoiceNotes.userId || linkedTransaction?.userId || linkedSubscription?.userId;
    const plan = subscriptionNotes.plan || paymentNotes.plan || invoiceNotes.plan || linkedTransaction?.plan || linkedSubscription?.plan;

    let billingInvoiceId: string | undefined;
    if (invoiceEntity?.id && userId && plan) {
      const invoice = await recordBillingInvoice({
        userId,
        plan,
        providerInvoiceId: invoiceEntity.id,
        providerPaymentId: invoiceEntity.payment_id || paymentEntity?.id || null,
        providerOrderId: invoiceEntity.order_id || paymentEntity?.order_id || null,
        providerSubscriptionId: invoiceEntity.subscription_id || subscriptionEntity?.id || null,
        status: invoiceEntity.status || payload.event.replace("invoice.", ""),
        amount: invoiceEntity.amount || paymentEntity?.amount || 0,
        currency: invoiceEntity.currency || paymentEntity?.currency || "INR",
        receipt: invoiceEntity.receipt || null,
        shortUrl: invoiceEntity.short_url || null,
        pdfUrl: invoiceEntity.pdf_url || null,
        billingStart: unixToDate(invoiceEntity.billing_start),
        billingEnd: unixToDate(invoiceEntity.billing_end),
        issuedAt: unixToDate(invoiceEntity.issued_at),
        paidAt: unixToDate(invoiceEntity.paid_at)
      });
      billingInvoiceId = invoice.id;
    }

    if (paymentEntity?.id) {
      await prisma.paymentTransaction.updateMany({
        where: {
          OR: [
            { razorpayPaymentId: paymentEntity.id },
            paymentEntity.order_id ? { razorpayOrderId: paymentEntity.order_id } : { id: "__never__" },
            subscriptionEntity?.id ? { razorpaySubscriptionId: subscriptionEntity.id } : { id: "__never__" },
            invoiceEntity?.subscription_id ? { razorpaySubscriptionId: invoiceEntity.subscription_id } : { id: "__never__" }
          ]
        },
        data: {
          razorpayPaymentId: paymentEntity.id,
          billingInvoiceId,
          status: paymentStatusFromEvent(payload.event, paymentEntity),
          amount: paymentEntity.amount || undefined,
          currency: paymentEntity.currency || undefined,
          failureReason: paymentEntity.status === "failed" ? paymentEntity.error_description || "Razorpay payment failed" : undefined
        }
      });
    }

    if (subscriptionEntity?.id && userId && plan && ["subscription.authenticated", "subscription.activated", "subscription.charged"].includes(payload.event)) {
      await activatePlan({
        userId,
        plan,
        provider: "RAZORPAY",
        providerSubscriptionId: subscriptionEntity.id,
        providerCustomerId: subscriptionEntity.customer_id || null,
        providerStatus: subscriptionEntity.status || payload.event.replace("subscription.", ""),
        currentPeriodStart: unixToDate(subscriptionEntity.current_start),
        currentPeriodEnd: unixToDate(subscriptionEntity.current_end),
        nextBillingAt: unixToDate(subscriptionEntity.charge_at)
      });
      await prisma.paymentTransaction.updateMany({
        where: { razorpaySubscriptionId: subscriptionEntity.id },
        data: { status: payload.event === "subscription.authenticated" ? "AUTHENTICATED" : "ACTIVE" }
      });
    }

    if (subscriptionEntity?.id && ["subscription.pending", "subscription.cancelled", "subscription.completed", "subscription.paused", "subscription.halted", "subscription.expired"].includes(payload.event)) {
      const mappedStatus = payload.event.replace("subscription.", "");
      await prisma.subscription.updateMany({
        where: { providerSubscriptionId: subscriptionEntity.id },
        data: {
          status: mappedStatus,
          providerStatus: subscriptionEntity.status || mappedStatus,
          currentPeriodStart: unixToDate(subscriptionEntity.current_start) || undefined,
          currentPeriodEnd: unixToDate(subscriptionEntity.current_end) || undefined,
          nextBillingAt: unixToDate(subscriptionEntity.charge_at) || undefined,
          endsAt: unixToDate(subscriptionEntity.ended_at) || unixToDate(subscriptionEntity.current_end) || (mappedStatus === "cancelled" ? new Date() : undefined),
          cancelledAt: mappedStatus === "cancelled" ? unixToDate(subscriptionEntity.ended_at) || new Date() : undefined,
          pausedAt: mappedStatus === "paused" ? new Date() : undefined,
          lastSyncedAt: new Date()
        }
      });
    }

    await prisma.razorpayWebhookEvent.update({ where: { eventId }, data: { processedAt: new Date(), processingError: null } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    await prisma.razorpayWebhookEvent.update({
      where: { eventId },
      data: { processingError: error instanceof Error ? error.message : "Webhook processing failed." }
    });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook processing failed." }, { status: 500 });
  }
}

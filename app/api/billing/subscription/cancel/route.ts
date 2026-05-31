import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cancelRazorpaySubscription, isRazorpayConfigured, unixToDate } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Login required." }, { status: 401 });
  if (!isRazorpayConfigured()) return NextResponse.json({ error: "Razorpay keys are not configured." }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const immediate = Boolean(body.immediate);

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      provider: "RAZORPAY",
      providerSubscriptionId: { not: null },
      status: { in: ["active", "authenticated", "pending"] }
    },
    orderBy: { startedAt: "desc" }
  });

  if (!subscription?.providerSubscriptionId) {
    return NextResponse.json({ error: "No active Razorpay autopay subscription found." }, { status: 404 });
  }

  const remote = await cancelRazorpaySubscription(subscription.providerSubscriptionId, !immediate);
  const now = new Date();
  const currentEnd = unixToDate(remote.current_end);
  const endedAt = unixToDate(remote.ended_at);

  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: immediate ? "cancelled" : "active",
      providerStatus: remote.status || (immediate ? "cancelled" : "cancel_requested"),
      cancelAtPeriodEnd: !immediate,
      cancellationRequestedAt: now,
      cancelledAt: immediate ? endedAt || now : null,
      currentPeriodEnd: currentEnd || subscription.currentPeriodEnd,
      endsAt: immediate ? endedAt || now : currentEnd || subscription.currentPeriodEnd,
      lastSyncedAt: now
    }
  });

  return NextResponse.json({ ok: true, subscription: updated });
}

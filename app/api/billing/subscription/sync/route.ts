import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isRazorpayConfigured, syncLocalSubscriptionFromRazorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Login required." }, { status: 401 });
  if (!isRazorpayConfigured()) return NextResponse.json({ error: "Razorpay keys are not configured." }, { status: 500 });

  const subscription = await prisma.subscription.findFirst({
    where: { userId: session.user.id, provider: "RAZORPAY", providerSubscriptionId: { not: null } },
    orderBy: { startedAt: "desc" },
    select: { id: true, providerSubscriptionId: true }
  });

  if (!subscription?.providerSubscriptionId) {
    return NextResponse.json({ error: "No Razorpay subscription found." }, { status: 404 });
  }

  const updated = await syncLocalSubscriptionFromRazorpay(subscription);
  return NextResponse.json({ ok: true, subscription: updated });
}

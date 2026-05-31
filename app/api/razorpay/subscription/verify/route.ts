import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { activatePlan, verifySubscriptionSignature } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { razorpaySubscriptionVerifySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Login required." }, { status: 401 });

  const parsed = razorpaySubscriptionVerifySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid subscription verification payload." }, { status: 400 });

  const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature } = parsed.data;
  const transaction = await prisma.paymentTransaction.findFirst({ where: { razorpaySubscriptionId: razorpay_subscription_id, userId: session.user.id }, orderBy: { createdAt: "desc" } });
  if (!transaction) return NextResponse.json({ error: "Subscription payment not found." }, { status: 404 });

  if (!verifySubscriptionSignature(razorpay_subscription_id, razorpay_payment_id, razorpay_signature)) {
    await prisma.paymentTransaction.update({ where: { id: transaction.id }, data: { status: "FAILED", failureReason: "Invalid Razorpay subscription signature" } });
    return NextResponse.json({ error: "Subscription signature verification failed." }, { status: 400 });
  }

  const subscription = await activatePlan({
    userId: session.user.id,
    plan: transaction.plan,
    provider: "RAZORPAY",
    providerSubscriptionId: razorpay_subscription_id,
    providerStatus: "authenticated"
  });

  const payment = await prisma.paymentTransaction.update({
    where: { id: transaction.id },
    data: { status: "AUTHENTICATED", razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature }
  });

  return NextResponse.json({ ok: true, payment, subscription });
}

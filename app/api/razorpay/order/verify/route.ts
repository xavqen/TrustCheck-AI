import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { activatePlan, recordBillingInvoice, verifyOrderSignature } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { razorpayOrderVerifySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Login required." }, { status: 401 });

  const parsed = razorpayOrderVerifySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payment verification payload." }, { status: 400 });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
  const transaction = await prisma.paymentTransaction.findUnique({ where: { razorpayOrderId: razorpay_order_id } });
  if (!transaction || transaction.userId !== session.user.id) return NextResponse.json({ error: "Payment order not found." }, { status: 404 });

  if (!verifyOrderSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    await prisma.paymentTransaction.update({ where: { id: transaction.id }, data: { status: "FAILED", failureReason: "Invalid Razorpay signature" } });
    return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
  }

  const subscription = await activatePlan({ userId: session.user.id, plan: transaction.plan, provider: "RAZORPAY", oneTimeDays: 30 });
  const invoice = transaction.billingInvoiceId
    ? await prisma.billingInvoice.findUniqueOrThrow({ where: { id: transaction.billingInvoiceId } })
    : await recordBillingInvoice({
        userId: session.user.id,
        plan: transaction.plan,
        providerPaymentId: razorpay_payment_id,
        providerOrderId: razorpay_order_id,
        status: "paid",
        amount: transaction.amount,
        currency: transaction.currency,
        receipt: transaction.receipt,
        billingStart: new Date(),
        billingEnd: subscription.endsAt,
        issuedAt: new Date(),
        paidAt: new Date()
      });
  const payment = await prisma.paymentTransaction.update({
    where: { id: transaction.id },
    data: { status: "CAPTURED", razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, billingInvoiceId: invoice.id }
  });

  return NextResponse.json({ ok: true, payment, subscription });
}

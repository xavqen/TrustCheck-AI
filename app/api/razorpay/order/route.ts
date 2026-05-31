import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createRazorpayOrder, getRazorpayKeyId, isRazorpayConfigured } from "@/lib/razorpay";
import { razorpayPlanSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Login required." }, { status: 401 });
  if (!isRazorpayConfigured()) return NextResponse.json({ error: "Razorpay keys are not configured." }, { status: 500 });

  const parsed = razorpayPlanSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan." }, { status: 400 });

  try {
    const order = await createRazorpayOrder({
      userId: session.user.id,
      plan: parsed.data.plan,
      name: session.user.name,
      email: session.user.email
    });

    return NextResponse.json({
      keyId: getRazorpayKeyId(),
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      name: session.user.name || "",
      email: session.user.email || ""
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create Razorpay order." }, { status: 500 });
  }
}

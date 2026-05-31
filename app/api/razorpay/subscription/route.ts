import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createRazorpaySubscription, getRazorpayKeyId, isRazorpayConfigured } from "@/lib/razorpay";
import { razorpayPlanSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Login required." }, { status: 401 });
  if (!isRazorpayConfigured()) return NextResponse.json({ error: "Razorpay keys are not configured." }, { status: 500 });

  const parsed = razorpayPlanSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan." }, { status: 400 });

  try {
    const subscription = await createRazorpaySubscription({
      userId: session.user.id,
      plan: parsed.data.plan,
      name: session.user.name,
      email: session.user.email
    });

    return NextResponse.json({
      keyId: getRazorpayKeyId(),
      subscriptionId: subscription.id,
      name: session.user.name || "",
      email: session.user.email || ""
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create Razorpay subscription." }, { status: 500 });
  }
}

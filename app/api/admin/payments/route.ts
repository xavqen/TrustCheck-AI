import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.email === env.ADMIN_EMAIL;
  if (!isAdmin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const [payments, webhooks] = await Promise.all([
    prisma.paymentTransaction.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { user: { select: { email: true, name: true } } } }),
    prisma.razorpayWebhookEvent.findMany({ orderBy: { createdAt: "desc" }, take: 20, select: { id: true, eventId: true, event: true, processedAt: true, createdAt: true } })
  ]);

  return NextResponse.json({ payments, webhooks });
}

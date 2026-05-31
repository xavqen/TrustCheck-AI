import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { billingRequestSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Login required to request a plan upgrade." }, { status: 401 });

  const limited = rateLimit(`billing:${session.user.id}`, { limit: 3, windowMs: 60 * 60 * 1000 });
  if (!limited.ok) return NextResponse.json({ error: "Too many upgrade requests. Try again later." }, { status: 429 });

  const parsed = billingRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check your billing request details." }, { status: 400 });

  const pending = await prisma.billingRequest.findFirst({
    where: { userId: session.user.id, status: "PENDING" },
    orderBy: { createdAt: "desc" }
  });

  if (pending) {
    return NextResponse.json({ error: "You already have a pending upgrade request." }, { status: 409 });
  }

  const saved = await prisma.billingRequest.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      company: parsed.data.company || null,
      plan: parsed.data.plan,
      message: parsed.data.message || null
    },
    select: { id: true, plan: true, status: true, createdAt: true }
  });

  return NextResponse.json({ request: saved }, { status: 201 });
}

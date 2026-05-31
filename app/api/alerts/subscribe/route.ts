import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { alertSubscriptionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "local";
  const limited = rateLimit(`alert-subscribe:${ip}`, { limit: 8, windowMs: 60_000 });
  if (!limited.ok) return NextResponse.json({ error: "Too many subscription attempts. Try again later." }, { status: 429 });

  try {
    const session = await auth();
    const body = alertSubscriptionSchema.parse(await request.json());
    const email = body.email.toLowerCase();
    const scamTypes = (body.scamTypes || []).map((item) => sanitizeText(item)).filter(Boolean);

    const existing = await prisma.alertSubscription.findUnique({ where: { email }, select: { id: true } });
    const subscription = await prisma.alertSubscription.upsert({
      where: { email },
      update: {
        userId: session?.user?.id,
        country: body.country ? sanitizeText(body.country) : null,
        scamTypes,
        frequency: body.frequency,
        source: body.source ? sanitizeText(body.source) : "alerts"
      },
      create: {
        userId: session?.user?.id,
        email,
        country: body.country ? sanitizeText(body.country) : null,
        scamTypes,
        frequency: body.frequency,
        source: body.source ? sanitizeText(body.source) : "alerts"
      }
    });

    return NextResponse.json({ subscription, updated: Boolean(existing) }, { status: existing ? 200 : 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid alert subscription." }, { status: 400 });
  }
}

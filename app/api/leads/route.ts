import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { integrationLeadSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "local";
  const limited = rateLimit(`integration-lead:${ip}`, { limit: 6, windowMs: 60_000 });
  if (!limited.ok) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });

  try {
    const session = await auth();
    const body = integrationLeadSchema.parse(await request.json());
    const lead = await prisma.integrationLead.create({
      data: {
        userId: session?.user?.id,
        name: sanitizeText(body.name),
        email: body.email.toLowerCase(),
        company: body.company ? sanitizeText(body.company) : null,
        useCase: sanitizeText(body.useCase),
        volume: body.volume ? sanitizeText(body.volume) : null,
        source: body.source ? sanitizeText(body.source) : "website"
      }
    });
    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

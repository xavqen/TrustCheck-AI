import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { feedbackSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "local";
  const limited = rateLimit(`feedback:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!limited.ok) return NextResponse.json({ error: "Too much feedback submitted. Try again later." }, { status: 429 });

  try {
    const session = await auth();
    const body = feedbackSchema.parse(await request.json());
    const feedback = await prisma.feedback.create({
      data: {
        userId: session?.user?.id,
        email: body.email?.toLowerCase(),
        message: sanitizeText(body.message),
        rating: body.rating
      }
    });
    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid feedback." }, { status: 400 });
  }
}

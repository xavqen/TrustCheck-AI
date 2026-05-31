import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkInputSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/sanitize";
import { analyzeScam } from "@/lib/scam/analyzer";
import { rateLimit, hashIdentifier } from "@/lib/rate-limit";
import { getPlanConfig, getUserPlan } from "@/lib/plans";

function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`check:${ip}`, { limit: 12, windowMs: 60_000 });
  if (!limited.ok) return NextResponse.json({ error: "Too many checks. Try again in a minute." }, { status: 429 });

  try {
    const session = await auth();
    const body = checkInputSchema.parse(await request.json());
    const cleanedInput = sanitizeText(body.input);

    if (!session?.user?.id) {
      const guestLimit = rateLimit(`guest-day:${ip}`, { limit: 5, windowMs: 86_400_000 });
      if (!guestLimit.ok) return NextResponse.json({ error: "Guest free limit reached. Sign up for more checks." }, { status: 403 });
    } else {
      const plan = await getUserPlan(session.user.id);
      const limit = getPlanConfig(plan).dailyCheckLimit;
      if (typeof limit === "number") {
        const todayCount = await prisma.scamCheck.count({ where: { userId: session.user.id, createdAt: { gte: startOfToday() } } });
        if (todayCount >= limit) return NextResponse.json({ error: "Free daily limit reached. Upgrade for unlimited checks." }, { status: 403 });
      }
    }

    const analysis = await analyzeScam({ type: body.type, input: cleanedInput });

    const saved = await prisma.scamCheck.create({
      data: {
        userId: session?.user?.id,
        type: body.type,
        input: cleanedInput,
        normalizedInput: analysis.normalizedInput,
        riskLevel: analysis.riskLevel,
        trustScore: analysis.trustScore,
        redFlags: analysis.redFlags,
        reasons: analysis.reasons,
        recommendedAction: analysis.recommendedAction,
        safeReply: analysis.safeReply,
        reportGuidance: analysis.reportGuidance,
        shareToken: randomUUID(),
        sourceIpHash: session?.user?.id ? undefined : hashIdentifier(ip)
      }
    });

    if (session?.user?.id) {
      const day = startOfToday();
      await prisma.apiUsage.upsert({
        where: { userId_route_day: { userId: session.user.id, route: "/api/check", day } },
        update: { count: { increment: 1 } },
        create: { userId: session.user.id, route: "/api/check", day }
      }).catch(() => undefined);
    }

    return NextResponse.json({ id: saved.id, shareToken: saved.shareToken, ...analysis });
  } catch (error) {
    return NextResponse.json({ error: "Could not analyze this content. Please check input length and format." }, { status: 400 });
  }
}

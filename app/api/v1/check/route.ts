import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { authenticateApiKey, recordApiUsage } from "@/lib/api-key";
import { analyzeScam } from "@/lib/scam/analyzer";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { checkInputSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const authResult = await authenticateApiKey(request);
  if (!authResult) return NextResponse.json({ error: "Invalid or missing Bearer API key." }, { status: 401 });
  if (authResult.deniedReason) return NextResponse.json({ error: authResult.deniedReason }, { status: 403 });

  const limited = rateLimit(`business-api:${authResult.user.id}`, { limit: 120, windowMs: 60_000 });
  if (!limited.ok) return NextResponse.json({ error: "Business API rate limit reached." }, { status: 429 });

  try {
    const body = checkInputSchema.parse(await request.json());
    const cleanedInput = sanitizeText(body.input);
    const analysis = await analyzeScam({ type: body.type, input: cleanedInput });

    const saved = await prisma.scamCheck.create({
      data: {
        userId: authResult.user.id,
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
        shareToken: randomUUID()
      }
    });

    await recordApiUsage(authResult.user.id, "/api/v1/check", authResult.apiKey.id).catch(() => undefined);

    return NextResponse.json({
      id: saved.id,
      shareToken: saved.shareToken,
      riskLevel: analysis.riskLevel,
      trustScore: analysis.trustScore,
      redFlags: analysis.redFlags,
      reasons: analysis.reasons,
      recommendedAction: analysis.recommendedAction,
      safeReply: analysis.safeReply,
      reportGuidance: analysis.reportGuidance
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}

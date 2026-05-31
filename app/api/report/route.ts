import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rate-limit";
import { makeReportSlug, maskSensitiveEvidence } from "@/lib/intel/report-utils";

async function uniquePublicSlug(base: string) {
  for (let index = 0; index < 6; index++) {
    const slug = index === 0 ? base : `${base}-${index + 1}`;
    const exists = await prisma.scamReport.findUnique({ where: { publicSlug: slug }, select: { id: true } });
    if (!exists) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "local";
  const limited = rateLimit(`report:${ip}`, { limit: 6, windowMs: 60_000 });
  if (!limited.ok) return NextResponse.json({ error: "Too many reports. Try again later." }, { status: 429 });

  try {
    const session = await auth();
    const body = reportSchema.parse(await request.json());
    const scamType = sanitizeText(body.scamType);
    const platform = sanitizeText(body.platform);
    const country = sanitizeText(body.country);
    const isPublic = Boolean(body.isPublic);
    const publicSlug = isPublic ? await uniquePublicSlug(makeReportSlug({ scamType, platform, country })) : undefined;

    const report = await prisma.scamReport.create({
      data: {
        userId: session?.user?.id,
        checkId: body.checkId,
        publicSlug,
        scamType,
        platform,
        country,
        description: maskSensitiveEvidence(body.description),
        screenshotUrl: body.screenshotUrl ? sanitizeText(body.screenshotUrl) : undefined,
        isPublic,
        status: isPublic ? "pending_review" : "submitted"
      }
    });
    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid report." }, { status: 400 });
  }
}

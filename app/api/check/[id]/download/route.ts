import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const check = await prisma.scamCheck.findFirst({ where: { id, userId: session.user.id } });
  if (!check) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const redFlags = Array.isArray(check.redFlags) ? check.redFlags.join("\n- ") : JSON.stringify(check.redFlags, null, 2);
  const reasons = Array.isArray(check.reasons) ? check.reasons.join("\n- ") : JSON.stringify(check.reasons, null, 2);
  const body = `TrustCheck AI Report\n\nDate: ${check.createdAt.toISOString()}\nType: ${check.type}\nRisk: ${check.riskLevel}\nTrust score: ${check.trustScore}/100\n\nInput:\n${check.input}\n\nRed flags:\n- ${redFlags}\n\nReasons:\n- ${reasons}\n\nRecommended action:\n${check.recommendedAction}\n\nSafe reply:\n${check.safeReply}\n\nReport guidance:\n${check.reportGuidance}\n`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="trustcheck-report-${check.id}.txt"`
    }
  });
}

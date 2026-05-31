import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const check = await prisma.scamCheck.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      type: true,
      input: true,
      riskLevel: true,
      trustScore: true,
      redFlags: true,
      reasons: true,
      recommendedAction: true,
      safeReply: true,
      reportGuidance: true,
      shareToken: true,
      createdAt: true
    }
  });
  if (!check) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ check });
}

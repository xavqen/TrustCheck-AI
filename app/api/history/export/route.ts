import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const checks = await prisma.scamCheck.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 1000,
    select: { id: true, type: true, riskLevel: true, trustScore: true, normalizedInput: true, createdAt: true }
  });

  const rows = [
    ["id", "type", "riskLevel", "trustScore", "normalizedInput", "createdAt"],
    ...checks.map((check) => [check.id, check.type, check.riskLevel, check.trustScore, check.normalizedInput || "", check.createdAt.toISOString()])
  ];

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="trustcheck-history.csv"'
    }
  });
}

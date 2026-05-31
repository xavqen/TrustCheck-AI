import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.email === env.ADMIN_EMAIL;
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [dangerByType, recentGuestChecks] = await Promise.all([
    prisma.scamCheck.groupBy({
      by: ["type", "riskLevel"],
      where: { createdAt: { gte: since } },
      _count: { _all: true }
    }),
    prisma.scamCheck.findMany({
      where: { createdAt: { gte: since }, userId: null },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: { id: true, type: true, riskLevel: true, trustScore: true, sourceIpHash: true, createdAt: true }
    })
  ]);

  return NextResponse.json({
    dangerByType: dangerByType
      .map((item) => ({ type: item.type, riskLevel: item.riskLevel, count: item._count._all }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    recentGuestChecks
  });
}

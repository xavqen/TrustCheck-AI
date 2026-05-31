import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function topCounts(items: string[], limit = 8) {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item, (counts.get(item) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name, count]) => ({ name, count }));
}

export async function GET() {
  const where = { isPublic: true, status: "approved" } as const;
  const [totalPublicReports, reports, helpfulVotes] = await Promise.all([
    prisma.scamReport.count({ where }),
    prisma.scamReport.findMany({
      where,
      orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
      take: 500,
      select: { scamType: true, country: true, platform: true, upvotes: true }
    }),
    prisma.reportVote.count()
  ]);

  return NextResponse.json({
    totalPublicReports,
    helpfulVotes,
    topScamTypes: topCounts(reports.map((report) => report.scamType)),
    topCountries: topCounts(reports.map((report) => report.country)),
    topPlatforms: topCounts(reports.map((report) => report.platform))
  });
}

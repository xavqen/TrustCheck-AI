import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";

function param(url: URL, key: string) {
  return sanitizeText(url.searchParams.get(key) || "").slice(0, 80);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = param(url, "q");
  const country = param(url, "country");
  const scamType = param(url, "type");
  const platform = param(url, "platform");
  const take = Math.min(Math.max(Number(url.searchParams.get("limit")) || 20, 1), 50);
  const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);

  const where: Prisma.ScamReportWhereInput = {
    isPublic: true,
    status: "approved",
    ...(country ? { country: { contains: country, mode: "insensitive" } } : {}),
    ...(scamType ? { scamType: { contains: scamType, mode: "insensitive" } } : {}),
    ...(platform ? { platform: { contains: platform, mode: "insensitive" } } : {}),
    ...(q ? {
      OR: [
        { scamType: { contains: q, mode: "insensitive" } },
        { platform: { contains: q, mode: "insensitive" } },
        { country: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } }
      ]
    } : {})
  };

  const [reports, total] = await Promise.all([
    prisma.scamReport.findMany({
      where,
      orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * take,
      take,
      select: { id: true, publicSlug: true, scamType: true, platform: true, country: true, description: true, createdAt: true, upvotes: true, views: true }
    }),
    prisma.scamReport.count({ where })
  ]);

  return NextResponse.json({ reports, total, page, limit: take });
}

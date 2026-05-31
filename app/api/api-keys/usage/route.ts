import { subDays } from "date-fns";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const from = startOfDay(subDays(new Date(), 13));
  const usage = await prisma.apiUsage.findMany({
    where: { userId: session.user.id, route: "/api/v1/check", day: { gte: from } },
    orderBy: { day: "asc" },
    select: { day: true, count: true, apiKey: { select: { id: true, name: true, keyPrefix: true } } }
  });

  const total = usage.reduce((sum, row) => sum + row.count, 0);
  return NextResponse.json({
    total,
    days: usage.map((row) => ({
      day: row.day.toISOString().slice(0, 10),
      count: row.count,
      keyName: row.apiKey?.name || "Unknown key",
      keyPrefix: row.apiKey?.keyPrefix || null
    }))
  });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanConfig, getUserPlan } from "@/lib/plans";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ plan: "FREE", usedToday: 0, apiUsedToday: 0, limit: 5, apiAccess: false });

  const today = startOfToday();
  const plan = await getUserPlan(session.user.id);
  const config = getPlanConfig(plan);
  const [usedToday, apiUsage] = await Promise.all([
    prisma.scamCheck.count({ where: { userId: session.user.id, createdAt: { gte: today } } }),
    prisma.apiUsage.findFirst({ where: { userId: session.user.id, route: "/api/v1/check", day: today } })
  ]);

  return NextResponse.json({
    plan,
    usedToday,
    apiUsedToday: apiUsage?.count || 0,
    limit: config.dailyCheckLimit,
    apiAccess: config.apiAccess,
    apiKeyLimit: config.apiKeys
  });
}

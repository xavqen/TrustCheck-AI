import { prisma } from "@/lib/prisma";
import type { RiskLevel } from "@prisma/client";

export type RiskBucket = { label: RiskLevel; count: number };
export type TypeBucket = { label: string; count: number };
export type CountryBucket = { country: string; count: number };
export type DailyBucket = { day: string; safe: number; suspicious: number; dangerous: number };

type DangerousAlert = { id: string; type: string; trustScore: number; redFlags: string[]; reason: string; createdAt: string };
type PublicReport = { id: string; scamType: string; platform: string; country: string; createdAt: string };

function startDate(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - Math.max(days - 1, 0));
  return date;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function emptySummary(days: number) {
  const daily: DailyBucket[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);
    daily.push({ day: dayKey(date), safe: 0, suspicious: 0, dangerous: 0 });
  }
  return {
    windowDays: days,
    totalChecks: 0,
    totalReports: 0,
    risk: (["SAFE", "SUSPICIOUS", "DANGEROUS"] as RiskLevel[]).map((label) => ({ label, count: 0 })),
    byType: [] as TypeBucket[],
    byCountry: [] as CountryBucket[],
    daily,
    recentDangerous: [] as DangerousAlert[],
    recentReports: [] as PublicReport[]
  };
}

export async function getThreatSummary(days = 30) {
  try {
    const since = startDate(days);
    const [riskGroups, typeGroups, countryGroups, recentDangerous, recentReports, totalChecks, totalReports] = await Promise.all([
      prisma.scamCheck.groupBy({ by: ["riskLevel"], where: { createdAt: { gte: since } }, _count: { _all: true } }),
      prisma.scamCheck.groupBy({ by: ["type"], where: { createdAt: { gte: since } }, _count: { _all: true }, orderBy: { _count: { type: "desc" } }, take: 8 }),
      prisma.scamReport.groupBy({ by: ["country"], where: { createdAt: { gte: since } }, _count: { _all: true }, orderBy: { _count: { country: "desc" } }, take: 8 }),
      prisma.scamCheck.findMany({ where: { riskLevel: "DANGEROUS", createdAt: { gte: since } }, select: { id: true, type: true, trustScore: true, redFlags: true, reasons: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 8 }),
      prisma.scamReport.findMany({ select: { id: true, scamType: true, platform: true, country: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 8 }),
      prisma.scamCheck.count({ where: { createdAt: { gte: since } } }),
      prisma.scamReport.count({ where: { createdAt: { gte: since } } })
    ]);

    const risk: RiskBucket[] = (["SAFE", "SUSPICIOUS", "DANGEROUS"] as RiskLevel[]).map((label) => ({
      label,
      count: riskGroups.find((item) => item.riskLevel === label)?._count._all || 0
    }));

    const byType: TypeBucket[] = typeGroups.map((item) => ({ label: item.type.replaceAll("_", " ").toLowerCase(), count: item._count._all }));
    const byCountry: CountryBucket[] = countryGroups.map((item) => ({ country: item.country, count: item._count._all }));

    const dailyMap = new Map<string, DailyBucket>();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);
      dailyMap.set(dayKey(date), { day: dayKey(date), safe: 0, suspicious: 0, dangerous: 0 });
    }

    const dailyChecks = await prisma.scamCheck.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, riskLevel: true }, orderBy: { createdAt: "asc" } });
    for (const check of dailyChecks) {
      const bucket = dailyMap.get(dayKey(check.createdAt));
      if (!bucket) continue;
      if (check.riskLevel === "SAFE") bucket.safe += 1;
      if (check.riskLevel === "SUSPICIOUS") bucket.suspicious += 1;
      if (check.riskLevel === "DANGEROUS") bucket.dangerous += 1;
    }

    return {
      windowDays: days,
      totalChecks,
      totalReports,
      risk,
      byType,
      byCountry,
      daily: Array.from(dailyMap.values()),
      recentDangerous: recentDangerous.map((item) => ({
        id: item.id,
        type: item.type,
        trustScore: item.trustScore,
        redFlags: Array.isArray(item.redFlags) ? item.redFlags.slice(0, 4).map(String) : [],
        reason: Array.isArray(item.reasons) ? String(item.reasons[0] || "Dangerous scam pattern detected.") : "Dangerous scam pattern detected.",
        createdAt: item.createdAt.toISOString()
      })),
      recentReports: recentReports.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }))
    };
  } catch {
    return emptySummary(days);
  }
}

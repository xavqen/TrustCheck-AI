import { NextResponse } from "next/server";
import { getThreatSummary } from "@/lib/intel/threats";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const days = Number(url.searchParams.get("days") || "30");
  const safeDays = Number.isFinite(days) ? Math.min(Math.max(days, 7), 90) : 30;
  const summary = await getThreatSummary(safeDays);
  return NextResponse.json(summary, {
    headers: {
      "Cache-Control": "private, max-age=60"
    }
  });
}

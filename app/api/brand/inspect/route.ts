import { NextResponse } from "next/server";
import { z } from "zod";
import { inspectBrandImpersonation } from "@/lib/intel/brand-watchlist";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

const schema = z.object({ input: z.string().trim().min(4).max(3000) });

function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`brand:${ip}`, { limit: 30, windowMs: 60_000 });
  if (!limited.ok) return NextResponse.json({ error: "Too many brand checks. Try again shortly." }, { status: 429 });

  try {
    const body = schema.parse(await request.json());
    const result = inspectBrandImpersonation(sanitizeText(body.input));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Paste a valid message or link under 3000 characters." }, { status: 400 });
  }
}

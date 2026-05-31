import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeUrlSignals, extractUrls } from "@/lib/scam/url";
import { sanitizeText } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rate-limit";

const payloadSchema = z.object({
  text: z.string().trim().min(4).max(3000)
});

function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`url-inspect:${ip}`, { limit: 30, windowMs: 60_000 });
  if (!limited.ok) return NextResponse.json({ error: "Too many URL inspections. Try again in a minute." }, { status: 429 });

  try {
    const body = payloadSchema.parse(await request.json());
    const text = sanitizeText(body.text);
    const urls = extractUrls(text);
    const analysis = analyzeUrlSignals(text);
    const totalSeverity = analysis.signals.reduce((sum, signal) => sum + signal.severity, 0);
    const verdict = totalSeverity >= 45 ? "DANGEROUS" : totalSeverity >= 18 ? "SUSPICIOUS" : "LOW_SIGNAL";

    return NextResponse.json({
      urls,
      verdict,
      signalCount: analysis.signals.length,
      totalSeverity,
      signals: analysis.signals,
      normalizedInput: analysis.normalizedInput
    });
  } catch {
    return NextResponse.json({ error: "Send JSON like { text: 'https://example.com' }." }, { status: 400 });
  }
}

import { createHash } from "crypto";
import { sanitizeText } from "@/lib/sanitize";

export function makeReportSlug(parts: { scamType: string; platform: string; country: string }) {
  const raw = `${parts.scamType}-${parts.platform}-${parts.country}`.toLowerCase();
  const slug = sanitizeText(raw)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return slug || "scam-report";
}

export function maskSensitiveEvidence(value: string) {
  return sanitizeText(value)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email hidden]")
    .replace(/\b(?:\+?\d[\d\s().-]{7,}\d)\b/g, "[phone hidden]")
    .replace(/\b\d{12,19}\b/g, "[number hidden]")
    .replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, "[id hidden]")
    .replace(/\b(?:otp|password|cvv|pin)\s*[:=-]?\s*\S+/gi, "$1 [hidden]");
}

export function compactSummary(text: string, max = 165) {
  const cleaned = maskSensitiveEvidence(text);
  return cleaned.length > max ? `${cleaned.slice(0, max - 1).trim()}…` : cleaned;
}

export function getVoterHash(request: Request, userId?: string | null) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const ua = request.headers.get("user-agent") || "unknown";
  return createHash("sha256").update(`${userId || "anon"}:${ip}:${ua}`).digest("hex");
}

export function reportStatusLabel(status: string) {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  if (status === "hidden") return "Hidden";
  if (status === "pending_review") return "Pending review";
  return "Submitted";
}

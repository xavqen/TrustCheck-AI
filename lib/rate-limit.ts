import crypto from "crypto";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, options: { limit: number; windowMs: number }) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { ok: true, remaining: options.limit - 1 };
  }
  if (current.count >= options.limit) return { ok: false, remaining: 0 };
  current.count += 1;
  return { ok: true, remaining: options.limit - current.count };
}

export function hashIdentifier(value: string) {
  return crypto.createHash("sha256").update(value + (process.env.AUTH_SECRET || "trustcheck")).digest("hex");
}

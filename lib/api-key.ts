import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { canUseBusinessApi, getActiveSubscription } from "@/lib/plans";

const API_KEY_PREFIX = "tc_live_";

export function hashApiKey(key: string) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function createRawApiKey() {
  return `${API_KEY_PREFIX}${crypto.randomBytes(32).toString("base64url")}`;
}

export function maskApiKey(prefix: string) {
  return `${prefix}••••••••••••••••`;
}

export async function createApiKey(userId: string, name: string) {
  const rawKey = createRawApiKey();
  const keyPrefix = rawKey.slice(0, 15);
  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      name,
      keyHash: hashApiKey(rawKey),
      keyPrefix
    },
    select: { id: true, name: true, keyPrefix: true, createdAt: true }
  });

  return { apiKey, rawKey };
}

export function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token?.startsWith(API_KEY_PREFIX)) return null;
  return token.trim();
}

export async function authenticateApiKey(request: Request) {
  const token = getBearerToken(request);
  if (!token) return null;

  const keyHash = hashApiKey(token);
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: {
      user: {
        include: {
          subscriptions: {
            where: { status: "active" },
            orderBy: { startedAt: "desc" },
            take: 1
          }
        }
      }
    }
  });

  if (!apiKey || apiKey.revokedAt) return null;
  const subscription = await getActiveSubscription(apiKey.user.id);
  const plan = subscription?.plan || "FREE";
  const allowed = canUseBusinessApi(plan, apiKey.user.role);
  if (!allowed) return { deniedReason: "Business API requires an active Business plan.", apiKey, user: apiKey.user } as const;

  await prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => undefined);
  return { apiKey, user: apiKey.user, deniedReason: null } as const;
}

export function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function recordApiUsage(userId: string, route: string, apiKeyId?: string) {
  const day = startOfToday();
  if (apiKeyId) {
    await prisma.apiUsage.upsert({
      where: { apiKeyId_route_day: { apiKeyId, route, day } },
      update: { count: { increment: 1 }, userId },
      create: { userId, apiKeyId, route, day }
    });
    return;
  }

  await prisma.apiUsage.upsert({
    where: { userId_route_day: { userId, route, day } },
    update: { count: { increment: 1 } },
    create: { userId, route, day }
  });
}

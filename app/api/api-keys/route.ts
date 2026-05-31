import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiKeyCreateSchema } from "@/lib/validation";
import { createApiKey, maskApiKey } from "@/lib/api-key";
import { rateLimit } from "@/lib/rate-limit";
import { canUseBusinessApi, getUserPlan } from "@/lib/plans";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id, revokedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, keyPrefix: true, createdAt: true, lastUsedAt: true }
  });

  return NextResponse.json({ keys: keys.map((key) => ({ ...key, maskedKey: maskApiKey(key.keyPrefix) })) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = rateLimit(`api-key:${session.user.id}`, { limit: 5, windowMs: 60_000 });
  if (!limited.ok) return NextResponse.json({ error: "Too many key requests. Try again later." }, { status: 429 });

  const parsed = apiKeyCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid key name." }, { status: 400 });

  const plan = await getUserPlan(session.user.id);
  if (!canUseBusinessApi(plan, session.user.role)) {
    return NextResponse.json({ error: "API keys require an active Business plan. Request upgrade from Billing." }, { status: 403 });
  }

  const activeKeys = await prisma.apiKey.count({ where: { userId: session.user.id, revokedAt: null } });
  if (activeKeys >= 5) return NextResponse.json({ error: "Maximum 5 active API keys allowed." }, { status: 400 });

  const { apiKey, rawKey } = await createApiKey(session.user.id, parsed.data.name);
  return NextResponse.json({ key: { ...apiKey, maskedKey: maskApiKey(apiKey.keyPrefix) }, rawKey }, { status: 201 });
}

import type { Plan, Subscription } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PLAN_CONFIG, type PlanConfig, type PlanId } from "@/lib/plan-config";

export { PLAN_CONFIG, type PlanConfig, type PlanId };

export function isSubscriptionActive(subscription?: Pick<Subscription, "status" | "endsAt"> | null) {
  if (!subscription || subscription.status !== "active") return false;
  return !subscription.endsAt || subscription.endsAt > new Date();
}

export async function getActiveSubscription(userId: string) {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId, status: "active" },
    orderBy: { startedAt: "desc" },
    take: 3
  });
  return subscriptions.find(isSubscriptionActive) || null;
}

export async function getUserPlan(userId?: string | null): Promise<Plan> {
  if (!userId) return "FREE";
  const subscription = await getActiveSubscription(userId);
  return subscription?.plan || "FREE";
}

export function getPlanConfig(plan: Plan) {
  return PLAN_CONFIG[plan as PlanId] || PLAN_CONFIG.FREE;
}

export function canUseBusinessApi(plan: Plan, role?: string | null) {
  return role === "ADMIN" || getPlanConfig(plan).apiAccess;
}

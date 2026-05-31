import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.email === env.ADMIN_EMAIL;
  return isAdmin;
}

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params;

  const billingRequest = await prisma.billingRequest.findUnique({ where: { id } });
  if (!billingRequest) return NextResponse.json({ error: "Billing request not found." }, { status: 404 });
  if (billingRequest.status !== "PENDING") return NextResponse.json({ error: "Billing request is already processed." }, { status: 400 });

  const user = billingRequest.userId
    ? await prisma.user.findUnique({ where: { id: billingRequest.userId } })
    : await prisma.user.findUnique({ where: { email: billingRequest.email } });

  if (!user) return NextResponse.json({ error: "User account not found for this request." }, { status: 404 });

  const result = await prisma.$transaction(async (tx) => {
    await tx.subscription.updateMany({ where: { userId: user.id, status: "active" }, data: { status: "replaced", endsAt: new Date() } });
    const subscription = await tx.subscription.create({ data: { userId: user.id, plan: billingRequest.plan, status: "active" } });
    const request = await tx.billingRequest.update({ where: { id }, data: { status: "APPROVED", userId: user.id } });
    return { subscription, request };
  });

  return NextResponse.json({ ok: true, subscription: result.subscription, request: result.request });
}

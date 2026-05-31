import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.email === env.ADMIN_EMAIL;
  if (!isAdmin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const { id } = await params;
  const billingRequest = await prisma.billingRequest.findUnique({ where: { id } });
  if (!billingRequest) return NextResponse.json({ error: "Billing request not found." }, { status: 404 });
  if (billingRequest.status !== "PENDING") return NextResponse.json({ error: "Billing request is already processed." }, { status: 400 });

  const updated = await prisma.billingRequest.update({ where: { id }, data: { status: "REJECTED" } });
  return NextResponse.json({ ok: true, request: updated });
}

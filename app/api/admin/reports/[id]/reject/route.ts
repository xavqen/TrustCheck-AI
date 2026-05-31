import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, isAdmin } = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const report = await prisma.scamReport.update({
    where: { id },
    data: { isPublic: false, status: "rejected", moderatedAt: new Date(), moderatedBy: session?.user?.email || "admin" }
  });
  return NextResponse.json({ report });
}

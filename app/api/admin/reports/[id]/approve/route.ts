import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { makeReportSlug } from "@/lib/intel/report-utils";

async function uniquePublicSlug(base: string, reportId: string) {
  for (let index = 0; index < 6; index++) {
    const slug = index === 0 ? base : `${base}-${index + 1}`;
    const exists = await prisma.scamReport.findUnique({ where: { publicSlug: slug }, select: { id: true } });
    if (!exists || exists.id === reportId) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, isAdmin } = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const current = await prisma.scamReport.findUnique({ where: { id }, select: { id: true, publicSlug: true, scamType: true, platform: true, country: true } });
  if (!current) return NextResponse.json({ error: "Report not found" }, { status: 404 });
  const publicSlug = current.publicSlug || await uniquePublicSlug(makeReportSlug(current), current.id);
  const report = await prisma.scamReport.update({
    where: { id },
    data: { publicSlug, isPublic: true, status: "approved", moderatedAt: new Date(), moderatedBy: session?.user?.email || "admin" }
  });
  return NextResponse.json({ report });
}

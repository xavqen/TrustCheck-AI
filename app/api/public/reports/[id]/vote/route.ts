import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getVoterHash } from "@/lib/intel/report-utils";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ip = request.headers.get("x-forwarded-for") || "local";
  const limited = rateLimit(`report-vote:${id}:${ip}`, { limit: 4, windowMs: 60_000 });
  if (!limited.ok) return NextResponse.json({ error: "Too many votes. Try again later." }, { status: 429 });

  const session = await auth();
  const report = await prisma.scamReport.findFirst({ where: { OR: [{ id }, { publicSlug: id }], isPublic: true, status: "approved" }, select: { id: true, upvotes: true } });
  if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });

  const voterHash = getVoterHash(request, session?.user?.id);

  try {
    await prisma.reportVote.create({ data: { reportId: report.id, userId: session?.user?.id, voterHash } });
    const updated = await prisma.scamReport.update({ where: { id: report.id }, data: { upvotes: { increment: 1 } }, select: { upvotes: true } });
    return NextResponse.json({ ok: true, upvotes: updated.upvotes });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "You already marked this report as helpful.", upvotes: report.upvotes }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not save vote." }, { status: 500 });
  }
}

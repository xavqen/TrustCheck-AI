import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.email !== env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [users, checks, dangerous, reports, feedback, apiKeys, pendingPublicReports, approvedPublicReports, razorpayPayments, activeAutopay, billingInvoices, cancelRequested] = await Promise.all([
    prisma.user.count(),
    prisma.scamCheck.count(),
    prisma.scamCheck.count({ where: { riskLevel: "DANGEROUS" } }),
    prisma.scamReport.count(),
    prisma.feedback.count(),
    prisma.apiKey.count({ where: { revokedAt: null } }),
    prisma.scamReport.count({ where: { status: "pending_review" } }),
    prisma.scamReport.count({ where: { isPublic: true, status: "approved" } }),
    prisma.paymentTransaction.count(),
    prisma.subscription.count({ where: { provider: "RAZORPAY", status: "active" } }),
    prisma.billingInvoice.count(),
    prisma.subscription.count({ where: { provider: "RAZORPAY", cancelAtPeriodEnd: true } })
  ]);

  return NextResponse.json({ users, checks, dangerous, reports, feedback, apiKeys, pendingPublicReports, approvedPublicReports, razorpayPayments, activeAutopay, billingInvoices, cancelRequested });
}

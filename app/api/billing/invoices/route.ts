import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Login required." }, { status: 401 });

  const invoices = await prisma.billingInvoice.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      plan: true,
      status: true,
      amount: true,
      currency: true,
      providerInvoiceId: true,
      providerPaymentId: true,
      shortUrl: true,
      pdfUrl: true,
      issuedAt: true,
      paidAt: true,
      createdAt: true
    }
  });

  return NextResponse.json({ invoices });
}

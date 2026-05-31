import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ReceiptText } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type InvoicePageProps = {
  params: Promise<{ id: string }>;
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR" }).format(amount / 100);
}

function formatDate(value?: Date | null) {
  return value ? value.toLocaleString() : "—";
}

export default async function BillingInvoicePage({ params }: InvoicePageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const invoice = await prisma.billingInvoice.findFirst({
    where: { id, userId: session.user.id },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 5 } }
  });

  if (!invoice) notFound();

  return (
    <section className="container-px mx-auto max-w-3xl py-10">
      <Button asChild variant="outline" className="mb-6"><Link href="/billing">Back to billing</Link></Button>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><ReceiptText className="size-5" /> Billing receipt</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">Local receipt generated from verified Razorpay payment/webhook data.</p>
            </div>
            <Badge variant={invoice.status === "paid" ? "safe" : invoice.status === "failed" ? "danger" : "warning"}>{invoice.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-3xl border bg-muted/30 p-5">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="mt-1 text-3xl font-bold">{formatMoney(invoice.amount, invoice.currency)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Plan: {invoice.plan}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border p-4"><p className="text-xs text-muted-foreground">Invoice ID</p><p className="mt-1 break-anywhere text-sm font-semibold">{invoice.providerInvoiceId || invoice.id}</p></div>
            <div className="rounded-2xl border p-4"><p className="text-xs text-muted-foreground">Payment ID</p><p className="mt-1 break-anywhere text-sm font-semibold">{invoice.providerPaymentId || "—"}</p></div>
            <div className="rounded-2xl border p-4"><p className="text-xs text-muted-foreground">Issued</p><p className="mt-1 text-sm font-semibold">{formatDate(invoice.issuedAt || invoice.createdAt)}</p></div>
            <div className="rounded-2xl border p-4"><p className="text-xs text-muted-foreground">Paid</p><p className="mt-1 text-sm font-semibold">{formatDate(invoice.paidAt)}</p></div>
            <div className="rounded-2xl border p-4"><p className="text-xs text-muted-foreground">Billing start</p><p className="mt-1 text-sm font-semibold">{formatDate(invoice.billingStart)}</p></div>
            <div className="rounded-2xl border p-4"><p className="text-xs text-muted-foreground">Billing end</p><p className="mt-1 text-sm font-semibold">{formatDate(invoice.billingEnd)}</p></div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {invoice.shortUrl ? <Button asChild><a href={invoice.shortUrl} target="_blank" rel="noreferrer">Open Razorpay invoice</a></Button> : null}
            {invoice.pdfUrl ? <Button asChild variant="outline"><a href={invoice.pdfUrl} target="_blank" rel="noreferrer">Download PDF</a></Button> : null}
            <Button asChild variant="outline"><Link href="/billing">View billing</Link></Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

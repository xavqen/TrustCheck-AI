import Link from "next/link";
import { FileText, ReceiptText } from "lucide-react";
import type { BillingInvoice } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatMoney(amount: number, currency: string) {
  const value = amount / 100;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR" }).format(value);
}

function formatDate(value?: Date | null) {
  return value ? value.toLocaleString() : "—";
}

function statusVariant(status: string) {
  const normalized = status.toLowerCase();
  if (["paid", "captured", "issued"].includes(normalized)) return "safe" as const;
  if (["created", "pending", "partially_paid"].includes(normalized)) return "warning" as const;
  if (["cancelled", "expired", "failed"].includes(normalized)) return "danger" as const;
  return "outline" as const;
}

export function BillingInvoiceList({ invoices }: { invoices: BillingInvoice[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ReceiptText className="size-5" /> Billing history</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {invoices.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-6 text-center">
            <FileText className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="font-semibold">No invoices yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Paid invoices and Razorpay receipt links will appear here after checkout/webhooks are received.</p>
          </div>
        ) : invoices.map((invoice) => (
          <div key={invoice.id} className="rounded-2xl border p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant(invoice.status)}>{invoice.status}</Badge>
                  <Badge variant="outline">{invoice.plan}</Badge>
                  {invoice.providerInvoiceId ? <Badge variant="secondary">Razorpay invoice</Badge> : <Badge variant="secondary">local receipt</Badge>}
                </div>
                <p className="mt-3 text-sm font-semibold">{formatMoney(invoice.amount, invoice.currency)}</p>
                <p className="mt-1 break-anywhere text-xs text-muted-foreground">Invoice: {invoice.providerInvoiceId || invoice.id}</p>
                <p className="mt-1 break-anywhere text-xs text-muted-foreground">Payment: {invoice.providerPaymentId || "—"}</p>
                <p className="mt-1 text-xs text-muted-foreground">Paid: {formatDate(invoice.paidAt)}</p>
              </div>
              <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-3 md:grid-cols-1">
                <Button asChild variant="outline" size="sm"><Link href={`/billing/invoices/${invoice.id}`}>View receipt</Link></Button>
                {invoice.shortUrl ? <Button asChild variant="outline" size="sm"><a href={invoice.shortUrl} target="_blank" rel="noreferrer">Open invoice</a></Button> : null}
                {invoice.pdfUrl ? <Button asChild variant="outline" size="sm"><a href={invoice.pdfUrl} target="_blank" rel="noreferrer">Download PDF</a></Button> : null}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

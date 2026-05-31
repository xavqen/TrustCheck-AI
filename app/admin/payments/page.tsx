import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPaymentsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.email === env.ADMIN_EMAIL;
  if (!isAdmin) redirect("/dashboard");

  const [payments, webhooks, activeRazorpaySubscriptions, invoices, cancelRequested] = await Promise.all([
    prisma.paymentTransaction.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { user: { select: { email: true, name: true } }, billingInvoice: { select: { providerInvoiceId: true, status: true, shortUrl: true } } } }),
    prisma.razorpayWebhookEvent.findMany({ orderBy: { createdAt: "desc" }, take: 20, select: { eventId: true, event: true, processedAt: true, processingError: true, createdAt: true } }),
    prisma.subscription.count({ where: { provider: "RAZORPAY", status: "active" } }),
    prisma.billingInvoice.findMany({ orderBy: { createdAt: "desc" }, take: 20, include: { user: { select: { email: true, name: true } } } }),
    prisma.subscription.count({ where: { provider: "RAZORPAY", cancelAtPeriodEnd: true } })
  ]);

  const captured = payments.filter((payment) => ["CAPTURED", "AUTHENTICATED", "ACTIVE"].includes(payment.status)).length;
  const failed = payments.filter((payment) => payment.status === "FAILED").length;

  return (
    <section className="container-px mx-auto max-w-7xl py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Razorpay payments</h1>
          <p className="mt-2 text-muted-foreground">Monitor one-time payments, autopay subscriptions and verified webhook delivery.</p>
        </div>
        <Button asChild variant="outline"><Link href="/admin">Back to admin</Link></Button>
      </div>

      <div className="responsive-stat-grid">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Successful / active</p><p className="mt-2 text-3xl font-bold">{captured}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Failed</p><p className="mt-2 text-3xl font-bold">{failed}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Active autopay</p><p className="mt-2 text-3xl font-bold">{activeRazorpaySubscriptions}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Cancel requested</p><p className="mt-2 text-3xl font-bold">{cancelRequested}</p></CardContent></Card>
      </div>

      <div className="mt-6 grid min-w-0 gap-6 2xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader><CardTitle>Recent payment transactions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {payments.length === 0 ? <p className="text-sm text-muted-foreground">No Razorpay payments yet.</p> : payments.map((payment) => (
              <div key={payment.id} className="rounded-2xl border p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={payment.status === "FAILED" ? "danger" : payment.status === "CREATED" ? "warning" : "safe"}>{payment.status}</Badge>
                      <Badge variant="outline">{payment.plan}</Badge>
                      <Badge variant="secondary">{payment.mode}</Badge>
                    </div>
                    <p className="mt-3 font-semibold">{payment.user.name || "User"} · {payment.user.email}</p>
                    <p className="mt-1 break-anywhere text-xs text-muted-foreground">Order: {payment.razorpayOrderId || "—"}</p>
                    <p className="mt-1 break-anywhere text-xs text-muted-foreground">Subscription: {payment.razorpaySubscriptionId || "—"}</p>
                    <p className="mt-1 break-anywhere text-xs text-muted-foreground">Payment: {payment.razorpayPaymentId || "—"}</p>
                    <p className="mt-1 break-anywhere text-xs text-muted-foreground">Invoice: {payment.billingInvoice?.providerInvoiceId || payment.billingInvoice?.status || "—"}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-lg font-bold">₹{(payment.amount / 100).toLocaleString("en-IN")}</p>
                    <p className="text-xs text-muted-foreground">{payment.currency}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{payment.createdAt.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent webhooks</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {webhooks.length === 0 ? <p className="text-sm text-muted-foreground">No webhooks received yet.</p> : webhooks.map((webhook) => (
              <div key={webhook.eventId} className="rounded-2xl border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={webhook.processingError ? "danger" : webhook.processedAt ? "safe" : "warning"}>{webhook.processingError ? "error" : webhook.processedAt ? "processed" : "pending"}</Badge>
                  <span className="text-sm font-semibold">{webhook.event}</span>
                </div>
                <p className="mt-2 break-anywhere text-xs text-muted-foreground">{webhook.eventId}</p>
                <p className="mt-1 text-xs text-muted-foreground">{webhook.createdAt.toLocaleString()}</p>
                {webhook.processingError ? <p className="mt-2 break-anywhere text-xs text-red-600">{webhook.processingError}</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>


      <Card className="mt-6">
        <CardHeader><CardTitle>Recent invoices / receipts</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {invoices.length === 0 ? <p className="text-sm text-muted-foreground">No invoices captured yet.</p> : invoices.map((invoice) => (
            <div key={invoice.id} className="rounded-2xl border p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={invoice.status === "paid" ? "safe" : invoice.status === "failed" ? "danger" : "warning"}>{invoice.status}</Badge>
                    <Badge variant="outline">{invoice.plan}</Badge>
                  </div>
                  <p className="mt-3 font-semibold">{invoice.user.name || "User"} · {invoice.user.email}</p>
                  <p className="mt-1 break-anywhere text-xs text-muted-foreground">Invoice: {invoice.providerInvoiceId || invoice.id}</p>
                  <p className="mt-1 break-anywhere text-xs text-muted-foreground">Payment: {invoice.providerPaymentId || "—"}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-lg font-bold">₹{(invoice.amount / 100).toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">{invoice.currency}</p>
                  {invoice.shortUrl ? <Button asChild variant="outline" size="sm" className="mt-2"><a href={invoice.shortUrl} target="_blank" rel="noreferrer">Open</a></Button> : null}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    </section>
  );
}

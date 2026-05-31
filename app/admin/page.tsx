import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.email === env.ADMIN_EMAIL;
  if (!isAdmin) redirect("/dashboard");

  const [users, totalChecks, dangerousChecks, activeApiKeys, pendingBilling, pendingPublicReports, integrationLeads, alertSubscribers, reports, feedback] = await Promise.all([
    prisma.user.count(),
    prisma.scamCheck.count(),
    prisma.scamCheck.count({ where: { riskLevel: "DANGEROUS" } }),
    prisma.apiKey.count({ where: { revokedAt: null } }),
    prisma.billingRequest.count({ where: { status: "PENDING" } }),
    prisma.scamReport.count({ where: { status: "pending_review" } }),
    prisma.integrationLead.count({ where: { status: "new" } }),
    prisma.alertSubscription.count(),
    prisma.scamReport.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.feedback.findMany({ orderBy: { createdAt: "desc" }, take: 10 })
  ]);

  return (
    <section className="container-px mx-auto max-w-7xl py-10">
      <h1 className="text-3xl font-bold tracking-tight">Admin dashboard</h1>
      <p className="mt-2 text-muted-foreground">Platform health, billing, scam reports and user feedback.</p>
      <div className="mt-4 responsive-actions">
        <Button asChild variant="outline"><Link href="/admin/billing">Review billing requests</Link></Button>
        <Button asChild variant="outline"><Link href="/admin/reports">Review public reports</Link></Button>
        <Button asChild variant="outline"><Link href="/admin/leads">Review leads</Link></Button>
        <Button asChild variant="outline"><Link href="/admin/payments">Razorpay payments</Link></Button>
        <Button asChild variant="outline"><Link href="/api/admin/stats">Open stats API</Link></Button>
      </div>

      <div className="mt-8 responsive-stat-grid">
        {[['Total users', users], ['Total checks', totalChecks], ['Dangerous checks', dangerousChecks], ['Pending billing', pendingBilling], ['Public review', pendingPublicReports], ['Active API keys', activeApiKeys], ['New leads', integrationLeads], ['Alert subscribers', alertSubscribers]].map(([label, value]) => (
          <Card key={label as string}><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></CardContent></Card>
        ))}
      </div>

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent reports</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="rounded-2xl border p-4">
                <div className="flex items-center gap-2"><Badge variant="danger">{report.scamType}</Badge><span className="text-sm text-muted-foreground">{report.platform} • {report.country}</span></div>
                <p className="mt-2 break-anywhere text-sm">{report.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Feedback list</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {feedback.map((item) => (
              <div key={item.id} className="rounded-2xl border p-4">
                <p className="text-sm">{item.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{item.email || 'Anonymous'} {item.rating ? `• ${item.rating}/5` : ''}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

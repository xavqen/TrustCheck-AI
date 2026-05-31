import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RiskChart } from "@/components/dashboard/risk-chart";
import { EmptyState } from "@/components/ui/empty-state";
import { TrustScoreMeter } from "@/components/checker/trust-score-meter";
import { reportStatusLabel } from "@/lib/intel/report-utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [checks, reports, total, safe, suspicious, dangerous] = await Promise.all([
    prisma.scamCheck.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.scamReport.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.scamCheck.count({ where: { userId: session.user.id } }),
    prisma.scamCheck.count({ where: { userId: session.user.id, riskLevel: "SAFE" } }),
    prisma.scamCheck.count({ where: { userId: session.user.id, riskLevel: "SUSPICIOUS" } }),
    prisma.scamCheck.count({ where: { userId: session.user.id, riskLevel: "DANGEROUS" } })
  ]);

  return (
    <section className="container-px mx-auto max-w-7xl py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Your private scam-check history and reports.</p>
        </div>
        <div className="responsive-actions"><Button asChild variant="outline"><Link href="/api/history/export">Export CSV</Link></Button><Button asChild variant="outline"><Link href="/settings">Settings</Link></Button><Button asChild><Link href="/checker">New check</Link></Button></div>
      </div>


      <div className="mb-6 responsive-stat-grid">
        {[
          ["First check", "/checker", "Analyze a suspicious message or link"],
          ["Onboarding", "/onboarding", "Test the full app flow"],
          ["Emergency", "/emergency", "What to do after a scam"],
          ["Billing", "/billing", "Upgrade or review limits"]
        ].map(([label, href, description]) => (
          <Link key={href} href={href} className="rounded-3xl border bg-card p-4 text-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <p className="font-bold">{label}</p>
            <p className="mt-1 text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>

      <div className="responsive-stat-grid">
        {[['Total checks', total], ['Safe', safe], ['Suspicious', suspicious], ['Dangerous', dangerous]].map(([label, value]) => (
          <Card key={label as string}><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></CardContent></Card>
        ))}
      </div>

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader><CardTitle>Risk chart</CardTitle></CardHeader>
          <CardContent className="space-y-5">{total ? <><TrustScoreMeter compact score={Math.round(((safe as number) * 100 + (suspicious as number) * 55 + (dangerous as number) * 15) / Math.max(total as number, 1))} riskLevel={(dangerous as number) > 0 ? "DANGEROUS" : (suspicious as number) > 0 ? "SUSPICIOUS" : "SAFE"} /><RiskChart data={[{ name: 'Safe', value: safe }, { name: 'Suspicious', value: suspicious }, { name: 'Dangerous', value: dangerous }]} /></> : <EmptyState title="No chart data" description="Run your first scam check to see analytics." />}</CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent history</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {checks.length === 0 ? <EmptyState title="No checks yet" description="Start by checking a suspicious message or link." /> : checks.map((check) => (
              <div key={check.id} className="rounded-2xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Badge variant={check.riskLevel === 'DANGEROUS' ? 'danger' : check.riskLevel === 'SUSPICIOUS' ? 'warning' : 'safe'}>{check.riskLevel}</Badge>
                    <p className="mt-2 line-clamp-2 break-anywhere text-sm font-medium">{check.input}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{check.type.replaceAll('_', ' ')} • {formatDistanceToNow(check.createdAt)} ago</p>
                  </div>
                  <div className="grid w-full gap-2 min-[420px]:w-auto min-[420px]:grid-cols-2">
                    {check.shareToken ? <Button asChild variant="outline" size="sm"><Link href={`/result/${check.shareToken}`}>Share</Link></Button> : null}
                    <Button asChild variant="outline" size="sm"><Link href={`/api/check/${check.id}/download`}>Download</Link></Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Saved reports</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {reports.length === 0 ? <EmptyState title="No reports submitted" description="Use the report page when you want to document a scam." /> : reports.map((report) => (
            <div key={report.id} className="rounded-2xl border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{report.scamType} on {report.platform}</p>
                <Badge variant={report.status === "approved" ? "safe" : report.status === "rejected" || report.status === "hidden" ? "danger" : report.isPublic ? "warning" : "outline"}>{reportStatusLabel(report.status)}</Badge>
                {report.publicSlug && report.status === "approved" ? <Button asChild variant="outline" size="sm"><Link href={`/scam-database/${report.publicSlug}`}>Public page</Link></Button> : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{report.country} • {formatDistanceToNow(report.createdAt)} ago</p>
              <p className="mt-2 line-clamp-3 break-anywhere text-sm">{report.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

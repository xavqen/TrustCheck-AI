import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Eye, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { reportStatusLabel } from "@/lib/intel/report-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReportModerationActions } from "@/components/admin/report-moderation-actions";

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) redirect("/dashboard");

  const { status = "pending_review" } = await searchParams;
  const allowed = ["pending_review", "approved", "rejected", "hidden", "submitted", "all"];
  const activeStatus = allowed.includes(status) ? status : "pending_review";

  const reports = await prisma.scamReport.findMany({
    where: activeStatus === "all" ? {} : { status: activeStatus },
    orderBy: { createdAt: "desc" },
    take: 80,
    select: { id: true, publicSlug: true, scamType: true, platform: true, country: true, description: true, isPublic: true, status: true, createdAt: true, upvotes: true, views: true, user: { select: { email: true } } }
  });

  const counts = await prisma.scamReport.groupBy({ by: ["status"], _count: { status: true } });
  const countFor = (name: string) => counts.find((item) => item.status === name)?._count.status || 0;

  return (
    <section className="container-px mx-auto max-w-7xl py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="secondary">Admin moderation</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Public report review</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Approve useful anonymous reports, reject low-quality reports, or hide unsafe public content.</p>
        </div>
        <Button asChild variant="outline"><Link href="/admin">Back to admin</Link></Button>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {[
          ["pending_review", `Pending ${countFor("pending_review")}`],
          ["approved", `Approved ${countFor("approved")}`],
          ["rejected", `Rejected ${countFor("rejected")}`],
          ["hidden", `Hidden ${countFor("hidden")}`],
          ["submitted", `Private ${countFor("submitted")}`],
          ["all", "All"]
        ].map(([key, label]) => (
          <Button key={key} asChild size="sm" variant={activeStatus === key ? "default" : "outline"} className="shrink-0">
            <Link href={`/admin/reports?status=${key}`}>{label}</Link>
          </Button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {reports.length ? reports.map((report) => (
          <Card key={report.id}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={report.status === "approved" ? "safe" : report.status === "rejected" || report.status === "hidden" ? "danger" : "warning"}>{reportStatusLabel(report.status)}</Badge>
                    <span className="text-xs font-semibold text-muted-foreground">{formatDistanceToNow(report.createdAt)} ago</span>
                    {report.isPublic ? <Badge variant="secondary">Public</Badge> : <Badge variant="outline">Private</Badge>}
                  </div>
                  <h2 className="mt-3 break-anywhere text-lg font-bold">{report.scamType}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{report.platform} • {report.country} • {report.user?.email || "anonymous"}</p>
                  <p className="mt-3 line-clamp-4 break-anywhere text-sm leading-6">{report.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1"><ShieldCheck className="size-3.5" /> {report.upvotes} helpful</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1"><Eye className="size-3.5" /> {report.views} views</span>
                    {report.publicSlug && report.status === "approved" ? <Link href={`/scam-database/${report.publicSlug}`} className="rounded-full bg-muted px-2.5 py-1 font-semibold hover:underline">Open public page</Link> : null}
                  </div>
                </div>
                <ReportModerationActions reportId={report.id} status={report.status} />
              </div>
            </CardContent>
          </Card>
        )) : <Card><CardContent className="p-8 text-center text-muted-foreground">No reports in this queue.</CardContent></Card>}
      </div>
    </section>
  );
}

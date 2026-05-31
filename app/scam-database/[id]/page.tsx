import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { AlertTriangle, ArrowLeft, Eye, Flag, MapPin, ShieldAlert, ThumbsUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { compactSummary } from "@/lib/intel/report-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReportHelpfulButton } from "@/components/intel/report-helpful-button";
import { PublicReportCard } from "@/components/intel/public-report-card";

async function getReport(id: string) {
  return prisma.scamReport.findFirst({
    where: { OR: [{ id }, { publicSlug: id }], isPublic: true, status: "approved" },
    select: { id: true, publicSlug: true, scamType: true, platform: true, country: true, description: true, createdAt: true, upvotes: true, views: true }
  });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) return { title: "Scam report not found" };
  return {
    title: `${report.scamType} scam report on ${report.platform}`,
    description: compactSummary(report.description),
    alternates: { canonical: `/scam-database/${report.publicSlug || report.id}` }
  };
}

export default async function PublicReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) notFound();

  await prisma.scamReport.update({ where: { id: report.id }, data: { views: { increment: 1 } } }).catch(() => null);

  const related = await prisma.scamReport.findMany({
    where: {
      id: { not: report.id },
      isPublic: true,
      status: "approved",
      OR: [{ scamType: report.scamType }, { platform: report.platform }, { country: report.country }]
    },
    orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
    take: 3,
    select: { id: true, publicSlug: true, scamType: true, platform: true, country: true, description: true, createdAt: true, upvotes: true, views: true }
  });

  return (
    <section className="container-px mx-auto max-w-6xl py-8 sm:py-10">
      <Button asChild variant="ghost" className="mb-4 -ml-3">
        <Link href="/scam-database"><ArrowLeft className="mr-2 size-4" /> Back to database</Link>
      </Button>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[1fr_330px] xl:items-start">
        <article className="rounded-[2rem] border bg-card p-4 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <Badge variant="warning">Verified community report</Badge>
              <h1 className="mt-4 break-anywhere text-2xl font-black tracking-tight sm:text-4xl">{report.scamType}</h1>
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1"><ShieldAlert className="size-4" /> {report.platform}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1"><MapPin className="size-4" /> {report.country}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1"><ThumbsUp className="size-4" /> {report.upvotes} helpful</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1"><Eye className="size-4" /> {report.views + 1} views</span>
              </div>
            </div>
            <time className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{format(report.createdAt, "dd MMM yyyy")}</time>
          </div>

          <div className="mt-6 rounded-3xl bg-muted/60 p-4 sm:p-5">
            <p className="whitespace-pre-wrap break-anywhere text-sm leading-7 sm:text-base">{report.description}</p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ReportHelpfulButton reportId={report.publicSlug || report.id} initialUpvotes={report.upvotes} />
            <Button asChild variant="outline" className="w-full sm:w-auto"><Link href="/report"><Flag className="mr-2 size-4" /> Report similar scam</Link></Button>
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-28">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><AlertTriangle className="size-5 text-amber-600" /> Safety action</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>Do not send money, OTPs, passwords, seed phrases, KYC documents, or remote-access permission.</p>
              <p>Block the sender, save evidence, and report through your country/platform channel.</p>
              <Button asChild className="w-full"><Link href="/emergency">Open emergency checklist</Link></Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Check your message</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Paste your message, URL, job offer, QR text, or seller details before taking action.</p>
              <Button asChild variant="outline" className="w-full"><Link href="/checker">Run scam check</Link></Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-black tracking-tight">Related public reports</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {related.length ? related.map((item) => <PublicReportCard key={item.id} report={item} />) : <p className="rounded-3xl border bg-card p-5 text-sm text-muted-foreground">No related public reports yet.</p>}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Eye, MapPin, ShieldAlert, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { compactSummary } from "@/lib/intel/report-utils";

export type PublicReportCardData = {
  id: string;
  publicSlug?: string | null;
  scamType: string;
  platform: string;
  country: string;
  description: string;
  createdAt: Date;
  upvotes?: number;
  views?: number;
};

export function PublicReportCard({ report }: { report: PublicReportCardData }) {
  const href = `/scam-database/${report.publicSlug || report.id}`;

  return (
    <article className="rounded-3xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Badge variant="warning" className="mb-3">Community report</Badge>
          <h2 className="break-anywhere text-lg font-bold tracking-tight"><Link href={href} className="hover:underline">{report.scamType}</Link></h2>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <ShieldAlert className="size-4" /> {report.platform}
            <span aria-hidden="true">•</span>
            <MapPin className="size-4" /> {report.country}
          </p>
        </div>
        <time className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          {formatDistanceToNow(report.createdAt)} ago
        </time>
      </div>
      <p className="mt-4 line-clamp-4 break-anywhere text-sm leading-6 text-muted-foreground">{compactSummary(report.description, 240)}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1"><ThumbsUp className="size-3.5" /> {report.upvotes || 0}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1"><Eye className="size-3.5" /> {report.views || 0}</span>
        </div>
        <Button asChild variant="outline" size="sm"><Link href={href}>View details</Link></Button>
      </div>
    </article>
  );
}

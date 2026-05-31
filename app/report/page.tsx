import Link from "next/link";
import { ReportForm } from "@/components/forms/report-form";
import { Button } from "@/components/ui/button";

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ checkId?: string }> }) {
  const { checkId } = await searchParams;
  return (
    <section className="container-px mx-auto max-w-3xl py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report a scam</h1>
          <p className="mt-2 text-muted-foreground">Save a private incident report or share an anonymized version to help others spot the same scam.</p>
        </div>
        <Button asChild variant="outline"><Link href="/scam-database">View database</Link></Button>
      </div>
      <div className="mt-8"><ReportForm checkId={checkId} /></div>
    </section>
  );
}

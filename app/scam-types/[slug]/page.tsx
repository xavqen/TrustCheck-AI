import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Search, ShieldAlert } from "lucide-react";
import { getScamPlaybook, SCAM_PLAYBOOKS } from "@/lib/content/scam-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function generateStaticParams() {
  return SCAM_PLAYBOOKS.map((playbook) => ({ slug: playbook.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const playbook = getScamPlaybook(slug);
  if (!playbook) return { title: "Scam guide" };
  return { title: playbook.title, description: playbook.summary, keywords: playbook.searchKeywords };
}

export default async function ScamTypeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const playbook = getScamPlaybook(slug);
  if (!playbook) notFound();

  return (
    <section className="container-px mx-auto max-w-5xl py-10">
      <Button asChild variant="ghost" className="mb-6 px-0">
        <Link href="/scam-types"><ArrowLeft className="mr-2 size-4" />Back to scam library</Link>
      </Button>

      <div className="rounded-3xl border bg-card p-6 sm:p-10">
        <Badge variant="danger">Scam guide</Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">{playbook.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{playbook.summary}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild><Link href="/checker">Check suspicious content</Link></Button>
          <Button asChild variant="outline"><Link href="/report">Report a scam</Link></Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert className="size-5 text-red-600" />Risk signals</CardTitle></CardHeader>
          <CardContent><ul className="space-y-3 text-sm text-muted-foreground">{playbook.riskSignals.map((item) => <li key={item} className="flex gap-2"><span className="mt-1 size-1.5 rounded-full bg-red-500" />{item}</li>)}</ul></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Search className="size-5 text-amber-600" />Verify first</CardTitle></CardHeader>
          <CardContent><ul className="space-y-3 text-sm text-muted-foreground">{playbook.verificationSteps.map((item) => <li key={item} className="flex gap-2"><span className="mt-1 size-1.5 rounded-full bg-amber-500" />{item}</li>)}</ul></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="size-5 text-emerald-600" />What to do</CardTitle></CardHeader>
          <CardContent><ul className="space-y-3 text-sm text-muted-foreground">{playbook.whatToDo.map((item) => <li key={item} className="flex gap-2"><span className="mt-1 size-1.5 rounded-full bg-emerald-500" />{item}</li>)}</ul></CardContent>
        </Card>
      </div>
    </section>
  );
}

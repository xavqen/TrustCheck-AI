import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { SCAM_PLAYBOOKS } from "@/lib/content/scam-types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Scam Type Library",
  description: "Learn common scam patterns including WhatsApp KYC fraud, fake job offers, crypto scams, fake loan apps, seller scams and QR payment fraud."
};

export default function ScamTypesPage() {
  return (
    <section className="container-px mx-auto max-w-7xl py-10">
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="warning">Scam playbooks</Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Scam type library</h1>
        <p className="mt-4 text-muted-foreground">Simple prevention guides for the scams users face most often across WhatsApp, email, shopping, jobs, loans, crypto and UPI/QR payments.</p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {SCAM_PLAYBOOKS.map((playbook) => (
          <Card key={playbook.slug} className="overflow-hidden">
            <CardContent className="flex h-full flex-col p-6">
              <div className="mb-4 grid size-11 place-items-center rounded-2xl bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200"><ShieldAlert className="size-5" /></div>
              <h2 className="text-xl font-bold">{playbook.title}</h2>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{playbook.summary}</p>
              <Button asChild variant="outline" className="mt-5 justify-between">
                <Link href={`/scam-types/${playbook.slug}`}>Read guide <ArrowRight className="size-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

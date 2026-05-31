import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Landmark, PhoneCall } from "lucide-react";
import { COUNTRY_GUIDES } from "@/lib/intel/country-guidance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Cybercrime Reporting Directory",
  description: "Country-wise scam reporting checklist with bank, telecom and evidence guidance."
};

export default function ReportingDirectoryPage() {
  return (
    <section className="container-px mx-auto max-w-7xl py-10">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <Badge variant="secondary">Reporting help</Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Cybercrime reporting directory</h1>
        <p className="mt-4 text-muted-foreground">Country-wise first-response steps for online fraud. Always contact your bank or payment provider first if money was lost.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {COUNTRY_GUIDES.map((guide) => (
          <Card key={guide.code}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-3">
                <span>{guide.country}</span>
                <Badge variant="outline">{guide.code}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-2xl bg-muted p-4"><PhoneCall className="mb-2 size-4" />{guide.emergency}</div>
              <div>
                <p className="font-semibold">Bank action</p>
                <p className="mt-1 text-muted-foreground">{guide.bankAction}</p>
              </div>
              <div>
                <p className="font-semibold">Telecom / platform action</p>
                <p className="mt-1 text-muted-foreground">{guide.telecomAction}</p>
              </div>
              <div>
                <p className="font-semibold">Evidence to save</p>
                <p className="mt-1 text-muted-foreground">{guide.evidence.join(", ")}</p>
              </div>
              {guide.cybercrimePortal.startsWith("http") ? (
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href={guide.cybercrimePortal} target="_blank" rel="noreferrer"><Landmark className="size-4" />Open official portal <ExternalLink className="size-4" /></Link>
                </Button>
              ) : <p className="rounded-2xl border p-3 text-muted-foreground">{guide.cybercrimePortal}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

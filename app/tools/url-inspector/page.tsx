import type { Metadata } from "next";
import { UrlInspector } from "@/components/tools/url-inspector";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "URL Inspector",
  description: "Inspect suspicious links for shortened URLs, risky TLDs, lookalike domains and phishing keywords."
};

export default function UrlInspectorPage() {
  return (
    <div className="container-px mx-auto max-w-7xl py-10">
      <div className="mb-8">
        <Badge variant="secondary">Free security tool</Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Suspicious URL inspector</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">Analyze visible link signals before opening unknown URLs from SMS, WhatsApp, email, QR codes or shopping sellers.</p>
      </div>
      <UrlInspector />
    </div>
  );
}

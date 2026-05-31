import type { Metadata } from "next";
import { ScamCheckerForm } from "@/components/checker/scam-checker-form";

export const metadata: Metadata = {
  title: "Scam Checker",
  description: "Check a suspicious URL, WhatsApp message, email, QR text, job offer, loan offer, crypto offer or shopping seller."
};

export default function CheckerPage() {
  return (
    <section className="container-px mx-auto max-w-6xl py-10">
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Scam checker</h1>
        <p className="mt-3 text-muted-foreground">Paste suspicious content. You will get a trust score, red flags, explanation, safe reply and report guidance.</p>
      </div>
      <ScamCheckerForm />
    </section>
  );
}

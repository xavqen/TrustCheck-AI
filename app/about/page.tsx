import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <section className="container-px mx-auto max-w-4xl py-10">
      <h1 className="text-3xl font-bold tracking-tight">About TrustCheck AI</h1>
      <Card className="mt-6"><CardContent className="space-y-4 p-6 text-muted-foreground">
        <p>TrustCheck AI is a safety-first web app for checking suspicious links, messages, emails, QR text, job offers, loan offers, investment pitches and shopping sellers.</p>
        <p>It combines deterministic scam-signal checks with optional server-side AI analysis. The goal is simple: help people pause, verify and avoid emotional manipulation before sending money or personal data.</p>
      </CardContent></Card>
    </section>
  );
}

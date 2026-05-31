export default function TermsPage() {
  const items = ["Use TrustCheck AI for safety guidance, not for illegal activity.", "Do not submit abusive, malicious or intentionally harmful content.", "Free usage has daily limits. Paid plans may receive higher limits.", "We may suspend accounts that abuse the service or attempt to bypass rate limits."];
  return <section className="container-px mx-auto max-w-4xl py-10"><h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1><ul className="mt-6 space-y-3 text-muted-foreground">{items.map((item) => <li key={item} className="rounded-2xl border bg-card p-4">{item}</li>)}</ul></section>;
}

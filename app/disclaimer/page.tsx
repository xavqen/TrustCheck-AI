export default function DisclaimerPage() {
  const items = ["TrustCheck AI provides risk indicators and safety suggestions, not legal, financial or law-enforcement advice.", "Scammers change tactics quickly. A safe score does not guarantee that a message or website is harmless.", "For financial loss, identity theft or threats, contact your bank, platform support and official cybercrime reporting channels immediately."];
  return <section className="container-px mx-auto max-w-4xl py-10"><h1 className="text-3xl font-bold tracking-tight">Disclaimer</h1><ul className="mt-6 space-y-3 text-muted-foreground">{items.map((item) => <li key={item} className="rounded-2xl border bg-card p-4">{item}</li>)}</ul></section>;
}

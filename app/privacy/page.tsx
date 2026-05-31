export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" items={["We collect account details needed for login and saved history.", "Scam checks are stored for logged-in users so they can view dashboard history.", "API keys are never sent to the browser.", "You can request deletion of your account data through the contact page."]} />;
}

function LegalPage({ title, items }: { title: string; items: string[] }) {
  return <section className="container-px mx-auto max-w-4xl py-10"><h1 className="text-3xl font-bold tracking-tight">{title}</h1><ul className="mt-6 space-y-3 text-muted-foreground">{items.map((item) => <li key={item} className="rounded-2xl border bg-card p-4">{item}</li>)}</ul></section>;
}

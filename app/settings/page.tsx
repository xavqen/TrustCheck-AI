import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveSubscription } from "@/lib/plans";
import { ApiKeyManager } from "@/components/settings/api-key-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const subscription = await getActiveSubscription(session.user.id);
  const plan = subscription?.plan || "FREE";

  return (
    <section className="container-px mx-auto max-w-5xl py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-2 text-muted-foreground">Manage account tools, billing, API keys and export options.</p>
        </div>
        <Badge variant={plan === "BUSINESS" ? "safe" : "secondary"}>{plan} plan</Badge>
      </div>

      <div className="mb-6 responsive-card-grid">
        <Card>
          <CardHeader><CardTitle>Data export</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Download your latest scam checks as CSV for backup or analysis.</p>
            <Button asChild variant="outline"><Link href="/api/history/export">Export CSV</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Billing</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>View limits, request upgrades and unlock Business API access.</p>
            <Button asChild variant="outline"><Link href="/billing">Open billing</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>API documentation</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Use TrustCheck AI from your own app with the server-to-server endpoint.</p>
            <Button asChild variant="outline"><Link href="/docs/api">Open API docs</Link></Button>
          </CardContent>
        </Card>
      </div>

      <ApiKeyManager />
    </section>
  );
}

import { LockKeyhole, ServerCog, ShieldCheck, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const items = [
  { title: "Server-side AI calls", description: "Provider keys stay in environment variables and are never exposed to the browser.", icon: ServerCog },
  { title: "Input validation", description: "All public write routes use Zod validation, sanitization and safe error responses.", icon: ShieldCheck },
  { title: "Auth protection", description: "Dashboard, settings and admin routes are protected by middleware and session checks.", icon: UserCheck },
  { title: "Security headers", description: "The app ships with frame, referrer, permissions and content-type protections in next.config.ts.", icon: LockKeyhole }
];

export default function SecurityPage() {
  return (
    <section className="container-px mx-auto max-w-5xl py-10">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-medium text-primary">Security model</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Built for safe scam analysis</h1>
        <p className="mt-3 text-muted-foreground">TrustCheck AI limits sensitive exposure, blocks abusive traffic and keeps user history private behind authentication.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardHeader><Icon className="size-7 text-primary" /><CardTitle>{item.title}</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">{item.description}</CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { PLAN_CONFIG } from "@/lib/plans";
import { BillingActions } from "@/components/admin/billing-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminBillingPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.email === env.ADMIN_EMAIL;
  if (!isAdmin) redirect("/dashboard");

  const requests = await prisma.billingRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 50,
    include: { user: { select: { email: true, name: true } } }
  });

  const pendingCount = requests.filter((request) => request.status === "PENDING").length;

  return (
    <section className="container-px mx-auto max-w-6xl py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing requests</h1>
          <p className="mt-2 text-muted-foreground">Approve plan requests and activate subscriptions without touching the database manually.</p>
        </div>
        <Button asChild variant="outline"><Link href="/admin">Back to admin</Link></Button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Pending</p><p className="mt-2 text-3xl font-bold">{pendingCount}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Loaded requests</p><p className="mt-2 text-3xl font-bold">{requests.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Admin email</p><p className="mt-2 truncate text-sm font-semibold">{env.ADMIN_EMAIL}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent plan requests</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {requests.length === 0 ? <p className="text-sm text-muted-foreground">No billing requests yet.</p> : requests.map((request) => (
            <div key={request.id} className="rounded-2xl border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={request.status === "PENDING" ? "warning" : request.status === "APPROVED" ? "safe" : "secondary"}>{request.status}</Badge>
                    <Badge variant="outline">{PLAN_CONFIG[request.plan].name}</Badge>
                    <span className="text-xs text-muted-foreground">{request.createdAt.toLocaleString()}</span>
                  </div>
                  <p className="mt-3 font-semibold">{request.name} · {request.email}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{request.company || "No company"} {request.user?.email ? `· Account: ${request.user.email}` : ""}</p>
                  {request.message ? <p className="mt-3 text-sm">{request.message}</p> : null}
                </div>
                {request.status === "PENDING" ? <BillingActions requestId={request.id} /> : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

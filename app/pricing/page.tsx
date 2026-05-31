import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { PLAN_CONFIG } from "@/lib/plan-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const planIds = ["FREE", "PRO", "FAMILY", "BUSINESS"] as const;

export default function PricingPage() {
  return (
    <section className="container-px mx-auto max-w-7xl py-10">
      <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Start free. Upgrade instantly with Razorpay or enable monthly autopay for paid plans.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {planIds.map((planId) => {
          const plan = PLAN_CONFIG[planId];
          const href = planId === "FREE" ? "/signup" : `/billing?plan=${planId}`;
          return (
            <Card key={plan.id} className={plan.id === "PRO" ? "border-emerald-500 shadow-glow" : ""}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-3xl font-bold">{plan.price}</p>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => <li key={feature} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />{feature}</li>)}
                </ul>
                <Button asChild className="w-full" variant={plan.id === "PRO" ? "default" : "outline"}>
                  <Link href={href}>{plan.id === "FREE" ? "Start free" : "Pay / Autopay"}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

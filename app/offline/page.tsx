import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Offline"
};

export default function OfflinePage() {
  return (
    <section className="container mx-auto px-4 py-20">
      <Card className="mx-auto max-w-xl text-center">
        <CardHeader>
          <CardTitle className="text-2xl">You are offline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>TrustCheck AI needs internet access for live scam checks, reports, dashboard data, and AI analysis.</p>
          <Button asChild><Link href="/">Try again</Link></Button>
        </CardContent>
      </Card>
    </section>
  );
}

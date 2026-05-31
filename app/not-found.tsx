import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <section className="container-px mx-auto grid min-h-[60vh] max-w-xl place-items-center py-10">
      <Card>
        <CardHeader><CardTitle>Page not found</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>This page may have moved or the result link is no longer valid.</p>
          <Button asChild><Link href="/checker">Run a new check</Link></Button>
        </CardContent>
      </Card>
    </section>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="container-px mx-auto grid min-h-[60vh] max-w-xl place-items-center py-10">
      <Card>
        <CardHeader><CardTitle>Something went wrong</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>The page could not load safely. Try again or go back to the dashboard.</p>
          <Button onClick={reset}>Retry</Button>
        </CardContent>
      </Card>
    </section>
  );
}

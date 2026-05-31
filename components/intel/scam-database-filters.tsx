import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ScamDatabaseFilters({ q, country, type, platform }: { q?: string; country?: string; type?: string; platform?: string }) {
  return (
    <form action="/scam-database" className="rounded-3xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr_auto]">
        <div className="relative md:col-span-2 xl:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Search scam story, keyword, brand..." className="pl-9" />
        </div>
        <Input name="country" defaultValue={country} placeholder="Country" />
        <Input name="type" defaultValue={type} placeholder="Scam type" />
        <Input name="platform" defaultValue={platform} placeholder="Platform" />
        <div className="grid grid-cols-2 gap-2 md:col-span-2 xl:col-span-1 xl:flex">
          <Button type="submit">Search</Button>
          <Button asChild type="button" variant="outline"><Link href="/scam-database">Clear</Link></Button>
        </div>
      </div>
    </form>
  );
}

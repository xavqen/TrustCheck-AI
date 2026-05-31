import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="container-px mx-auto max-w-7xl py-10">
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-5 w-full max-w-xl" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    </section>
  );
}

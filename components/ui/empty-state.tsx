import { ShieldAlert } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="grid min-h-[180px] place-items-center rounded-2xl border border-dashed p-6 text-center"><div><ShieldAlert className="mx-auto mb-3 size-8 text-muted-foreground" /><p className="font-medium">{title}</p><p className="mt-1 text-sm text-muted-foreground">{description}</p></div></div>;
}

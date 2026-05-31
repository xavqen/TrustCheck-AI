"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ReportModerationActions({ reportId, status }: { reportId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function act(action: "approve" | "reject" | "hide") {
    setLoading(action);
    const response = await fetch(`/api/admin/reports/${reportId}/${action}`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    setLoading(null);
    if (!response.ok) return toast.error(data.error || "Action failed");
    toast.success(action === "hide" ? "Report hidden" : `Report ${action}d`);
    router.refresh();
  }

  return (
    <div className="grid gap-2 sm:flex sm:flex-wrap">
      {status !== "approved" ? <Button size="sm" onClick={() => act("approve")} disabled={!!loading}>Approve public</Button> : null}
      {status !== "rejected" ? <Button size="sm" variant="outline" onClick={() => act("reject")} disabled={!!loading}>Reject</Button> : null}
      {status !== "hidden" ? <Button size="sm" variant="destructive" onClick={() => act("hide")} disabled={!!loading}>Hide</Button> : null}
    </div>
  );
}

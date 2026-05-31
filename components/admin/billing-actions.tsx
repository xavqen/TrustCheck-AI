"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function BillingActions({ requestId }: { requestId: string }) {
  const router = useRouter();

  const act = async (action: "approve" | "reject") => {
    const response = await fetch(`/api/admin/billing/${requestId}/${action}`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(data.error || `Could not ${action} request`);
      return;
    }
    toast.success(action === "approve" ? "Plan approved" : "Request rejected");
    router.refresh();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={() => act("approve")}><CheckCircle2 className="mr-2 size-4" /> Approve</Button>
      <Button size="sm" variant="outline" onClick={() => act("reject")}><XCircle className="mr-2 size-4" /> Reject</Button>
    </div>
  );
}

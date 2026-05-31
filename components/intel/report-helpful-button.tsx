"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportHelpfulButton({ reportId, initialUpvotes }: { reportId: string; initialUpvotes: number }) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);

  async function vote() {
    setLoading(true);
    const response = await fetch(`/api/public/reports/${reportId}/vote`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      toast.error(data.error || "Could not save vote");
      if (typeof data.upvotes === "number") setUpvotes(data.upvotes);
      return;
    }

    setVoted(true);
    setUpvotes(data.upvotes);
    toast.success("Marked as helpful");
  }

  return (
    <Button onClick={vote} disabled={loading || voted} variant={voted ? "secondary" : "outline"} className="w-full sm:w-auto">
      <ThumbsUp className="mr-2 size-4" /> {voted ? "Helpful saved" : "Helpful"} · {upvotes}
    </Button>
  );
}

import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrustScoreMeter({ score, riskLevel, compact = false }: { score: number; riskLevel: "SAFE" | "SUSPICIOUS" | "DANGEROUS"; compact?: boolean }) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const Icon = riskLevel === "SAFE" ? CheckCircle2 : riskLevel === "SUSPICIOUS" ? AlertTriangle : ShieldAlert;
  const tone = riskLevel === "SAFE" ? "text-emerald-600" : riskLevel === "SUSPICIOUS" ? "text-amber-600" : "text-red-600";
  const ringColor = riskLevel === "SAFE" ? "#059669" : riskLevel === "SUSPICIOUS" ? "#D97706" : "#DC2626";
  const track = riskLevel === "SAFE" ? "from-emerald-500 to-teal-400" : riskLevel === "SUSPICIOUS" ? "from-amber-500 to-orange-400" : "from-red-500 to-rose-500";

  return (
    <div className={cn("flex items-center gap-4", compact ? "gap-3" : "")}> 
      <div
        className={cn("relative grid shrink-0 place-items-center rounded-full", compact ? "size-20" : "size-28")}
        style={{ background: `conic-gradient(${ringColor} ${safeScore * 3.6}deg, hsl(var(--muted)) 0deg)` }}
      >
        <div className={cn("absolute inset-0 rounded-full bg-gradient-to-br opacity-20", track)} />
        <div className={cn("grid rounded-full bg-card text-center shadow-sm", compact ? "size-16 place-items-center" : "size-[5.5rem] place-items-center")}> 
          <div>
            <p className={cn("font-black leading-none", compact ? "text-2xl" : "text-4xl", tone)}>{safeScore}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">score</p>
          </div>
        </div>
      </div>
      <div className="min-w-0">
        <div className={cn("mb-1 flex items-center gap-2 font-bold", tone)}><Icon className="size-5" /> {riskLevel}</div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {riskLevel === "SAFE" ? "Looks lower-risk, but still verify sender identity before sharing sensitive details." : riskLevel === "SUSPICIOUS" ? "Some warning signs detected. Verify independently before taking action." : "High-risk pattern detected. Do not pay, click, share OTP, or continue the conversation."}
        </p>
      </div>
    </div>
  );
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function riskBadgeVariant(risk: "SAFE" | "SUSPICIOUS" | "DANGEROUS") {
  if (risk === "SAFE") return "safe" as const;
  if (risk === "SUSPICIOUS") return "warning" as const;
  return "danger" as const;
}

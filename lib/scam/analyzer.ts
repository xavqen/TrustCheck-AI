import { analyzeWithAI } from "@/lib/scam/ai";
import { analyzeUrlSignals } from "@/lib/scam/url";
import { inspectBrandImpersonation } from "@/lib/intel/brand-watchlist";

export type CheckType = "URL" | "WHATSAPP" | "EMAIL" | "JOB_OFFER" | "LOAN_OFFER" | "CRYPTO_INVESTMENT" | "SHOPPING_SELLER" | "QR_TEXT" | "SCREENSHOT_TEXT" | "OTHER";
export type RiskLevel = "SAFE" | "SUSPICIOUS" | "DANGEROUS";
export type ScamAnalysis = {
  riskLevel: RiskLevel;
  trustScore: number;
  redFlags: string[];
  reasons: string[];
  recommendedAction: string;
  safeReply: string;
  reportGuidance: string;
  normalizedInput?: string;
};

type Pattern = { label: string; severity: number; regex: RegExp; reason: string };

const patterns: Pattern[] = [
  { label: "Urgency pressure", severity: 12, regex: /urgent|immediately|within\s+\d+\s*(min|hour)|last chance|expire|blocked|suspended|limited time/i, reason: "Scammers create panic so victims act without verification." },
  { label: "Money request", severity: 18, regex: /send money|transfer|upi|bank account|wire|gift card|processing fee|registration fee|security deposit|advance/i, reason: "Unexpected payment requests are a major fraud signal." },
  { label: "Credential or KYC request", severity: 18, regex: /password|otp|one time password|cvv|pin|kyc|aadhaar|pan|login|verify account/i, reason: "Real support teams do not ask for OTP, CVV, PIN or password through messages." },
  { label: "Too-good-to-be-true offer", severity: 12, regex: /guaranteed profit|double your money|100% profit|free iphone|lottery|prize|winner|reward|airdrop/i, reason: "Unrealistic rewards are used to pull users into phishing or payment traps." },
  { label: "Fake authority", severity: 10, regex: /government|police|income tax|rbi|bank manager|customs|court|fbi|interpol|official notice/i, reason: "Fraudsters often impersonate authorities to create fear." },
  { label: "Crypto investment pressure", severity: 16, regex: /crypto|bitcoin|usdt|wallet|seed phrase|trading bot|mining|exchange|airdrop/i, reason: "Crypto scams commonly promise high returns or ask for wallet access." },
  { label: "Fake job pattern", severity: 14, regex: /job offer|work from home|salary|interview fee|hr manager|telegram task|like and earn|part time income/i, reason: "Fake jobs often ask for fees or push users to messaging apps." },
  { label: "Loan or refund bait", severity: 12, regex: /instant loan|pre approved|refund|cashback|subsidy|claim amount|loan approved/i, reason: "Loan and refund scams ask for documents, fees or credentials." },
  { label: "Delivery scam", severity: 10, regex: /parcel|delivery failed|custom fee|address confirmation|reschedule delivery/i, reason: "Fake delivery alerts often lead to payment phishing pages." },
  { label: "Romance or trust grooming", severity: 12, regex: /love you|send help|emergency|my wallet|stuck abroad|military doctor|private investment/i, reason: "Romance scams build emotional trust before asking for money." }
];

const safeReplyDanger = "I will not click links, share OTP/passwords, or send money. I will verify only through the official website, app, or customer support number.";
const safeReplySuspicious = "Thanks. I will verify this from an official source before taking any action.";

function localAnalyze(type: CheckType, input: string): ScamAnalysis {
  const redFlags: string[] = [];
  const reasons: string[] = [];
  let riskPoints = 0;

  for (const pattern of patterns) {
    if (pattern.regex.test(input)) {
      redFlags.push(pattern.label);
      reasons.push(pattern.reason);
      riskPoints += pattern.severity;
    }
  }

  const brandResult = inspectBrandImpersonation(input);
  if (brandResult.suspectedBrands.length > 0) {
    redFlags.push(`Brand impersonation signal: ${brandResult.suspectedBrands.join(", ")}`);
    reasons.push("The message appears to reference a known brand, bank, wallet, shopping app or account provider. Brand messages should be verified only through official apps or manually typed official domains.");
    riskPoints += Math.min(25, brandResult.riskScore);
  }
  for (const hint of brandResult.suspiciousDomainHints) {
    redFlags.push("Lookalike brand domain");
    reasons.push(hint);
    riskPoints += 18;
  }

  const urlResult = analyzeUrlSignals(input);
  for (const signal of urlResult.signals) {
    redFlags.push(signal.label);
    reasons.push(signal.detail);
    riskPoints += signal.severity;
  }

  if (type === "URL" && urlResult.signals.length === 0 && input.includes(".")) {
    reasons.push("No strong phishing URL signal was found, but the domain should still be verified through official search or bookmarks.");
  }

  if (type === "JOB_OFFER" && /fee|deposit|training kit|telegram|whatsapp/i.test(input)) riskPoints += 10;
  if (type === "CRYPTO_INVESTMENT" && /guaranteed|daily profit|double/i.test(input)) riskPoints += 16;
  if (type === "LOAN_OFFER" && /processing fee|insurance fee|pre approved/i.test(input)) riskPoints += 14;

  const hasUrl = /https?:\/\/|www\.|[a-z0-9.-]+\.[a-z]{2,}/i.test(input);
  if (hasUrl && redFlags.length === 0) {
    redFlags.push("Contains link");
    reasons.push("Any unexpected link should be opened only after verifying the sender and domain.");
    riskPoints += 6;
  }

  const trustScore = Math.max(0, Math.min(100, 100 - riskPoints));
  const riskLevel: RiskLevel = trustScore <= 45 || riskPoints >= 48 ? "DANGEROUS" : trustScore <= 75 || riskPoints >= 20 ? "SUSPICIOUS" : "SAFE";

  const recommendedAction = riskLevel === "DANGEROUS"
    ? "Do not click, reply, pay, download files or share personal information. Block the sender and report the incident."
    : riskLevel === "SUSPICIOUS"
      ? "Pause and verify through an official website, app, verified phone number or trusted source before acting."
      : "Low risk found from the provided text. Still verify sender identity before sharing sensitive information.";

  return {
    riskLevel,
    trustScore,
    redFlags: redFlags.length ? Array.from(new Set(redFlags)).slice(0, 12) : ["No major scam pattern detected"],
    reasons: reasons.length ? Array.from(new Set(reasons)).slice(0, 12) : ["The content does not strongly match common scam tactics in the local detection rules."],
    recommendedAction,
    safeReply: riskLevel === "DANGEROUS" ? safeReplyDanger : safeReplySuspicious,
    reportGuidance: "Save screenshots, sender details, links, phone numbers, payment IDs and timestamps. Report to the platform, your bank if money is involved, and your national cybercrime portal.",
    normalizedInput: urlResult.normalizedInput
  };
}

export async function analyzeScam(payload: { type: CheckType; input: string }): Promise<ScamAnalysis> {
  const local = localAnalyze(payload.type, payload.input);
  const ai = await analyzeWithAI(payload.type, payload.input).catch(() => null);
  if (!ai) return local;

  const mergedScore = Math.round(local.trustScore * 0.45 + ai.trustScore * 0.55);
  const riskLevel: RiskLevel = mergedScore <= 45 ? "DANGEROUS" : mergedScore <= 75 ? "SUSPICIOUS" : "SAFE";
  return {
    riskLevel,
    trustScore: mergedScore,
    redFlags: Array.from(new Set([...local.redFlags, ...ai.redFlags])).slice(0, 12),
    reasons: Array.from(new Set([...ai.reasons, ...local.reasons])).slice(0, 12),
    recommendedAction: ai.recommendedAction || local.recommendedAction,
    safeReply: ai.safeReply || local.safeReply,
    reportGuidance: ai.reportGuidance || local.reportGuidance,
    normalizedInput: local.normalizedInput || ai.normalizedInput
  };
}

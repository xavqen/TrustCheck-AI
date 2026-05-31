import { env } from "@/lib/env";
import type { CheckType, ScamAnalysis } from "@/lib/scam/analyzer";

export function scamPrompt(type: CheckType, input: string) {
  return `You are TrustCheck AI, a cybersecurity scam detection analyst. Analyze the following ${type} content for scam risk. Check urgency pressure, money request, fake authority, suspicious links, grammar manipulation, too-good-to-be-true offers, phishing signs, fake KYC, fake delivery, fake job, fake investment, fake refund, fake loan, romance scam, crypto scam and social engineering patterns. Return strict JSON with keys: riskLevel as SAFE or SUSPICIOUS or DANGEROUS, trustScore number 0-100, redFlags string array, reasons string array, recommendedAction string, safeReply string, reportGuidance string. Content: ${JSON.stringify(input)}`;
}

function normalizeAI(data: Partial<ScamAnalysis>): ScamAnalysis | null {
  if (!data.riskLevel || !["SAFE", "SUSPICIOUS", "DANGEROUS"].includes(data.riskLevel)) return null;
  return {
    riskLevel: data.riskLevel,
    trustScore: Math.max(0, Math.min(100, Number(data.trustScore ?? 50))),
    redFlags: Array.isArray(data.redFlags) ? data.redFlags.slice(0, 12) : [],
    reasons: Array.isArray(data.reasons) ? data.reasons.slice(0, 12) : [],
    recommendedAction: data.recommendedAction || "Pause and verify through an official channel before acting.",
    safeReply: data.safeReply || "I will verify this through the official website or support channel before taking action.",
    reportGuidance: data.reportGuidance || "Save screenshots, links, phone numbers and payment details. Report to the relevant platform or cybercrime portal.",
    normalizedInput: data.normalizedInput
  };
}

export async function analyzeWithAI(type: CheckType, input: string): Promise<ScamAnalysis | null> {
  if (env.AI_PROVIDER === "openai" && env.OPENAI_API_KEY) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: scamPrompt(type, input) }],
        temperature: 0.2
      })
    });
    if (!response.ok) return null;
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) return null;
    return normalizeAI(JSON.parse(text));
  }

  if (env.AI_PROVIDER === "gemini" && env.GEMINI_API_KEY) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: scamPrompt(type, input) }] }] })
    });
    if (!response.ok) return null;
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/```json|```/g, "").trim();
    if (!text) return null;
    return normalizeAI(JSON.parse(text));
  }

  return null;
}

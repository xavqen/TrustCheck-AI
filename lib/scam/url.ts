const shorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "cutt.ly", "rebrand.ly", "shorturl.at", "lnkd.in"];
const riskyTlds = ["zip", "mov", "click", "country", "kim", "loan", "work", "gq", "tk", "cf", "ml"];
const suspiciousKeywords = ["verify", "kyc", "urgent", "reward", "bonus", "free", "claim", "refund", "airdrop", "wallet", "password", "login", "secure", "support", "unlock", "blocked"];
const brandTargets = ["paypal", "google", "amazon", "microsoft", "apple", "netflix", "binance", "facebook", "instagram", "whatsapp", "telegram", "sbi", "hdfc", "icici", "axis"];

export type UrlSignal = { label: string; severity: number; detail: string };

export function extractUrls(text: string) {
  const matches = text.match(/https?:\/\/[^\s]+|www\.[^\s]+|[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?/gi) || [];
  return Array.from(new Set(matches.map((url) => url.replace(/[),.]+$/, ""))));
}

export function analyzeUrlSignals(text: string): { normalizedInput?: string; signals: UrlSignal[] } {
  const urls = extractUrls(text);
  const signals: UrlSignal[] = [];

  for (const raw of urls) {
    const urlText = raw.startsWith("http") ? raw : `https://${raw}`;
    try {
      const url = new URL(urlText);
      const host = url.hostname.toLowerCase().replace(/^www\./, "");
      const tld = host.split(".").pop() || "";

      if (!raw.startsWith("https://")) signals.push({ label: "No visible HTTPS", severity: 14, detail: `${host} is not shown with https:// in the pasted text.` });
      if (shorteners.includes(host)) signals.push({ label: "Shortened link", severity: 18, detail: `${host} hides the final destination.` });
      if (riskyTlds.includes(tld)) signals.push({ label: "High-risk domain ending", severity: 12, detail: `.${tld} domains are often abused in phishing campaigns.` });
      if (/\d+\.\d+\.\d+\.\d+/.test(host)) signals.push({ label: "Raw IP address", severity: 18, detail: "Legitimate consumer services rarely ask users to log in through raw IP addresses." });
      if (host.split(".").length > 3) signals.push({ label: "Deep subdomain chain", severity: 8, detail: `${host} uses multiple subdomains that may hide the real domain.` });
      if (suspiciousKeywords.some((word) => url.href.toLowerCase().includes(word))) signals.push({ label: "Suspicious URL keyword", severity: 10, detail: "The link contains words commonly used in phishing pages." });

      for (const brand of brandTargets) {
        if (host.includes(brand) && !host.endsWith(`${brand}.com`) && !host.endsWith(`${brand}.in`) && !host.endsWith(`${brand}.org`)) {
          signals.push({ label: "Lookalike brand domain", severity: 22, detail: `${host} appears to imitate ${brand}.` });
          break;
        }
      }
    } catch {
      signals.push({ label: "Malformed URL", severity: 12, detail: `${raw} could not be parsed as a clean URL.` });
    }
  }

  return { normalizedInput: urls[0], signals };
}

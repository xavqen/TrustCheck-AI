export type BrandProfile = {
  name: string;
  category: string;
  officialDomains: string[];
  sensitiveTerms: string[];
};

export type BrandInspection = {
  suspectedBrands: string[];
  matchedOfficialDomain: boolean;
  suspiciousDomainHints: string[];
  riskScore: number;
  recommendation: string;
};

export const BRAND_WATCHLIST: BrandProfile[] = [
  { name: "Google", category: "Account", officialDomains: ["google.com", "accounts.google.com", "gmail.com"], sensitiveTerms: ["gmail", "google account", "drive storage", "password reset"] },
  { name: "Microsoft", category: "Account", officialDomains: ["microsoft.com", "live.com", "office.com", "outlook.com"], sensitiveTerms: ["outlook", "office 365", "microsoft account", "mailbox"] },
  { name: "Amazon", category: "Shopping", officialDomains: ["amazon.com", "amazon.in", "amazon.co.uk"], sensitiveTerms: ["prime", "refund", "delivery", "order failed"] },
  { name: "PayPal", category: "Payment", officialDomains: ["paypal.com"], sensitiveTerms: ["payment received", "limited account", "refund", "invoice"] },
  { name: "Paytm", category: "Wallet", officialDomains: ["paytm.com", "paytmbank.com"], sensitiveTerms: ["kyc", "wallet blocked", "upi", "bank"] },
  { name: "PhonePe", category: "UPI", officialDomains: ["phonepe.com"], sensitiveTerms: ["cashback", "upi", "collect", "reward"] },
  { name: "State Bank of India", category: "Bank", officialDomains: ["sbi.co.in", "onlinesbi.sbi"], sensitiveTerms: ["sbi", "yono", "kyc", "account blocked"] },
  { name: "HDFC Bank", category: "Bank", officialDomains: ["hdfcbank.com"], sensitiveTerms: ["hdfc", "netbanking", "kyc", "credit card"] },
  { name: "Meta", category: "Social", officialDomains: ["facebook.com", "instagram.com", "meta.com", "whatsapp.com"], sensitiveTerms: ["facebook page", "instagram copyright", "whatsapp verification", "blue tick"] },
  { name: "Netflix", category: "Subscription", officialDomains: ["netflix.com"], sensitiveTerms: ["subscription expired", "payment failed", "account suspended"] }
];

const domainRegex = /(?:https?:\/\/)?(?:www\.)?([a-z0-9.-]+\.[a-z]{2,})(?:[\/\s?#:]|$)/gi;

function extractDomains(input: string) {
  const domains = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = domainRegex.exec(input.toLowerCase())) !== null) {
    domains.add(match[1].replace(/\.$/, ""));
  }
  return Array.from(domains);
}

function looksLikeBrandDomain(domain: string, brand: BrandProfile) {
  const compactDomain = domain.replace(/[^a-z0-9]/g, "");
  const compactBrand = brand.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const sensitiveHit = brand.sensitiveTerms.some((term) => compactDomain.includes(term.toLowerCase().replace(/[^a-z0-9]/g, "")));
  return compactDomain.includes(compactBrand) || sensitiveHit;
}

export function inspectBrandImpersonation(input: string): BrandInspection {
  const lower = input.toLowerCase();
  const domains = extractDomains(input);
  const suspectedBrands = BRAND_WATCHLIST.filter((brand) => {
    const textHit = lower.includes(brand.name.toLowerCase()) || brand.sensitiveTerms.some((term) => lower.includes(term.toLowerCase()));
    const domainHit = domains.some((domain) => looksLikeBrandDomain(domain, brand));
    return textHit || domainHit;
  });

  const matchedOfficialDomain = suspectedBrands.some((brand) => domains.some((domain) => brand.officialDomains.some((official) => domain === official || domain.endsWith(`.${official}`))));
  const suspiciousDomainHints = domains.flatMap((domain) => suspectedBrands.filter((brand) => looksLikeBrandDomain(domain, brand) && !brand.officialDomains.some((official) => domain === official || domain.endsWith(`.${official}`))).map((brand) => `${domain} looks related to ${brand.name} but is not in its official domain list.`));

  let riskScore = 0;
  if (suspectedBrands.length > 0) riskScore += 20;
  if (suspiciousDomainHints.length > 0) riskScore += 45;
  if (/otp|password|cvv|pin|kyc|verify|blocked|suspended|refund|cashback/i.test(input)) riskScore += 20;
  if (/urgent|immediately|within\s+\d+|last chance/i.test(input)) riskScore += 10;
  if (matchedOfficialDomain && suspiciousDomainHints.length === 0) riskScore = Math.max(0, riskScore - 25);

  const recommendation = suspiciousDomainHints.length > 0
    ? "Do not use this link. Open the brand's official app or type the official website manually."
    : suspectedBrands.length > 0
      ? "Verify this through the official app or website before sharing data or making payment."
      : "No watched brand impersonation pattern was detected. Still verify unknown senders and links.";

  return {
    suspectedBrands: suspectedBrands.map((brand) => brand.name),
    matchedOfficialDomain,
    suspiciousDomainHints: Array.from(new Set(suspiciousDomainHints)),
    riskScore: Math.min(100, riskScore),
    recommendation
  };
}

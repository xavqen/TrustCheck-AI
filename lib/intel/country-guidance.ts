export type CountryGuide = {
  code: string;
  country: string;
  emergency: string;
  cybercrimePortal: string;
  bankAction: string;
  telecomAction: string;
  evidence: string[];
};

export const COUNTRY_GUIDES: CountryGuide[] = [
  {
    code: "IN",
    country: "India",
    emergency: "Call 1930 quickly if money was lost, then file a report on the national cybercrime portal.",
    cybercrimePortal: "https://cybercrime.gov.in",
    bankAction: "Call your bank fraud helpline, freeze affected cards/accounts, and ask for a written complaint/ticket number.",
    telecomAction: "Report suspicious calls/SMS to your telecom provider and block the number inside WhatsApp/SMS/call apps.",
    evidence: ["Screenshots", "UPI ID or bank account", "Phone number", "URL", "Transaction ID", "Date and time"]
  },
  {
    code: "US",
    country: "United States",
    emergency: "Contact your bank/card issuer first, then report fraud through FTC/IC3 channels depending on the incident.",
    cybercrimePortal: "https://reportfraud.ftc.gov",
    bankAction: "Freeze affected cards, dispute transactions, enable alerts, and place fraud alerts with credit bureaus if identity data leaked.",
    telecomAction: "Forward suspicious SMS to 7726 where supported and report phishing messages inside the app used.",
    evidence: ["Emails with headers", "Screenshots", "Wallet/address", "Bank transfer records", "Seller profile", "Tracking numbers"]
  },
  {
    code: "GB",
    country: "United Kingdom",
    emergency: "Contact your bank immediately, then report the incident to Action Fraud where appropriate.",
    cybercrimePortal: "https://www.actionfraud.police.uk",
    bankAction: "Ask the bank to stop or recall payments, freeze cards, and open a fraud case.",
    telecomAction: "Forward scam texts to 7726 where available and report messages in WhatsApp/email apps.",
    evidence: ["Sort code/account", "Screenshots", "Phone number", "Chat export", "Payment reference", "Website URL"]
  },
  {
    code: "CA",
    country: "Canada",
    emergency: "Call your bank first, then report to the Canadian Anti-Fraud Centre if relevant.",
    cybercrimePortal: "https://antifraudcentre-centreantifraude.ca",
    bankAction: "Freeze cards/accounts, change online banking password, and document the fraud report number.",
    telecomAction: "Report suspicious calls/messages to the platform and your carrier when possible.",
    evidence: ["Receipts", "Interac/payment details", "Chat screenshots", "Email headers", "Sender profile", "URL"]
  },
  {
    code: "AU",
    country: "Australia",
    emergency: "Contact your bank first, then report scams through Scamwatch or cybercrime reporting channels.",
    cybercrimePortal: "https://www.scamwatch.gov.au/report-a-scam",
    bankAction: "Request payment stop/recall, freeze cards, and enable transaction alerts.",
    telecomAction: "Report scam calls/SMS to your carrier and block the sender.",
    evidence: ["BSB/account", "Screenshots", "Email headers", "Phone number", "Payment reference", "Website URL"]
  },
  {
    code: "GLOBAL",
    country: "Other country",
    emergency: "Contact your bank or payment provider first. Then report to your national cybercrime, consumer protection, or police portal.",
    cybercrimePortal: "Use your official government cybercrime or consumer fraud reporting website.",
    bankAction: "Freeze payment methods, dispute unauthorized transactions, change passwords, and preserve case numbers.",
    telecomAction: "Block/report the sender on the platform and preserve screenshots before deleting messages.",
    evidence: ["Screenshots", "Sender profile", "Phone/email", "URL", "Payment IDs", "Timestamps"]
  }
];

export function getCountryGuide(codeOrCountry?: string) {
  const value = (codeOrCountry || "").trim().toLowerCase();
  return COUNTRY_GUIDES.find((guide) => guide.code.toLowerCase() === value || guide.country.toLowerCase() === value) || COUNTRY_GUIDES[COUNTRY_GUIDES.length - 1];
}

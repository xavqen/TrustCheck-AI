export type ScamPlaybook = {
  slug: string;
  title: string;
  summary: string;
  riskSignals: string[];
  verificationSteps: string[];
  whatToDo: string[];
  searchKeywords: string[];
};

export const SCAM_PLAYBOOKS: ScamPlaybook[] = [
  {
    slug: "whatsapp-kyc-scam",
    title: "WhatsApp KYC and account-block scam",
    summary: "Fraudsters pretend to be banks, wallets, delivery companies or government services and create panic around KYC, blocked accounts or expired verification.",
    riskSignals: ["OTP, PIN, CVV or password request", "Urgent account-block warning", "Unofficial support number", "Shortened or lookalike link", "Threat to freeze account within minutes"],
    verificationSteps: ["Open the official app directly instead of the link", "Call the verified number from the official website or card", "Check whether the sender has a verified business profile", "Never share OTP, PIN, CVV or screen-share access"],
    whatToDo: ["Do not click the link", "Block and report the sender", "Save screenshots and phone number", "If money was lost, contact bank support immediately"],
    searchKeywords: ["whatsapp scam checker", "fake kyc message", "otp fraud", "bank account blocked scam"]
  },
  {
    slug: "fake-job-offer-scam",
    title: "Fake job offer and task scam",
    summary: "Scammers offer high salary, work-from-home jobs or simple online tasks, then ask for registration fees, deposits, training-kit money or crypto payments.",
    riskSignals: ["Registration or security deposit fee", "Interview only on Telegram or WhatsApp", "Unrealistic daily income", "No official company email", "Pressure to pay before joining"],
    verificationSteps: ["Check company career page", "Verify recruiter email domain", "Search company name plus scam or complaint", "Never pay to get a job"],
    whatToDo: ["Ask for official company email confirmation", "Refuse all joining fees", "Report the profile on the platform", "Keep payment and chat evidence"],
    searchKeywords: ["fake job offer checker", "work from home scam", "telegram task scam", "job registration fee fraud"]
  },
  {
    slug: "crypto-investment-scam",
    title: "Crypto and investment return scam",
    summary: "These scams promise guaranteed returns, daily profit, trading bots, mining pools or private signals, then steal deposits or wallet access.",
    riskSignals: ["Guaranteed profit", "Daily fixed return", "USDT wallet request", "Seed phrase request", "Fake dashboard showing locked profit"],
    verificationSteps: ["Check regulator registration", "Verify exchange domain manually", "Reject seed phrase or private key requests", "Search wallet address and project name"],
    whatToDo: ["Do not send more money to unlock funds", "Save wallet addresses and transaction hashes", "Report to exchange and cybercrime portal", "Warn contacts if account was compromised"],
    searchKeywords: ["crypto scam checker", "investment scam", "fake trading bot", "usdt scam"]
  },
  {
    slug: "fake-loan-scam",
    title: "Fake instant loan and processing-fee scam",
    summary: "Fake lenders claim a loan is approved and demand processing fees, insurance fees, GST, KYC charges or app permissions before release.",
    riskSignals: ["Loan approved without verification", "Processing fee before disbursal", "Request for Aadhaar/PAN over chat", "Unknown APK download", "Threat calls after installing app"],
    verificationSteps: ["Check lender name on official regulator lists", "Use only app-store apps from known lenders", "Read permission requests", "Never pay upfront fees to release a loan"],
    whatToDo: ["Do not install unknown APKs", "Revoke app permissions", "Contact bank if documents or money were shared", "Report abusive calls and numbers"],
    searchKeywords: ["loan app scam", "instant loan fraud", "processing fee loan scam", "fake lender checker"]
  },
  {
    slug: "shopping-seller-scam",
    title: "Fake shopping seller and advance-payment scam",
    summary: "Fraud sellers use huge discounts, copied product photos, fake tracking, no COD, and pressure for advance UPI or bank transfer.",
    riskSignals: ["Price far below market", "No cash on delivery", "Only UPI/bank transfer", "New social profile", "Copied reviews or product images"],
    verificationSteps: ["Reverse-search product photos", "Check seller age and reviews", "Use buyer-protected payment", "Avoid deals outside marketplace checkout"],
    whatToDo: ["Do not pay outside trusted checkout", "Keep invoice, chat and payment proofs", "Report seller to marketplace/social platform", "Dispute payment quickly if scammed"],
    searchKeywords: ["fake seller checker", "shopping scam", "instagram seller fraud", "advance payment scam"]
  },
  {
    slug: "qr-code-payment-scam",
    title: "QR code payment and collect-request scam",
    summary: "Victims are tricked into scanning QR codes or approving collect requests that send money instead of receiving it.",
    riskSignals: ["Scan QR to receive money", "UPI collect request", "Account verification fee", "Remote support guiding payment app", "Pressure during call"],
    verificationSteps: ["Remember QR scan usually sends money", "Read UPI screen before entering PIN", "Never approve collect requests from strangers", "End calls before checking payment details"],
    whatToDo: ["Reject unknown collect requests", "Do not enter PIN to receive money", "Report UPI ID and transaction ID", "Call bank immediately after unauthorized debit"],
    searchKeywords: ["qr code scam", "upi collect request fraud", "scan qr receive money scam", "payment scam checker"]
  }
];

export function getScamPlaybook(slug: string) {
  return SCAM_PLAYBOOKS.find((playbook) => playbook.slug === slug);
}

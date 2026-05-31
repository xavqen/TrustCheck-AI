export type PlanId = "FREE" | "PRO" | "FAMILY" | "BUSINESS";

export type PlanConfig = {
  id: PlanId;
  name: string;
  price: string;
  amountPaise: number;
  currency: "INR";
  dailyCheckLimit: number | null;
  apiAccess: boolean;
  apiKeys: number;
  billingInterval: "monthly";
  description: string;
  features: string[];
};

export const PLAN_CONFIG: Record<PlanId, PlanConfig> = {
  FREE: {
    id: "FREE",
    name: "Free",
    price: "₹0",
    amountPaise: 0,
    currency: "INR",
    dailyCheckLimit: 5,
    apiAccess: false,
    apiKeys: 0,
    billingInterval: "monthly",
    description: "For quick personal checks.",
    features: ["5 scam checks/day", "Trust score", "Basic result sharing", "Scam reporting"]
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    price: "₹299/mo",
    amountPaise: 29900,
    currency: "INR",
    dailyCheckLimit: null,
    apiAccess: false,
    apiKeys: 0,
    billingInterval: "monthly",
    description: "For heavy personal use.",
    features: ["Unlimited scam checks", "Saved history", "Download reports", "Priority analysis UX"]
  },
  FAMILY: {
    id: "FAMILY",
    name: "Family",
    price: "₹599/mo",
    amountPaise: 59900,
    currency: "INR",
    dailyCheckLimit: null,
    apiAccess: false,
    apiKeys: 0,
    billingInterval: "monthly",
    description: "For households and shared safety.",
    features: ["Unlimited checks", "Family safety workflow", "Shared scam education", "Better reporting"]
  },
  BUSINESS: {
    id: "BUSINESS",
    name: "Business API",
    price: "₹1,499/mo",
    amountPaise: 149900,
    currency: "INR",
    dailyCheckLimit: null,
    apiAccess: true,
    apiKeys: 5,
    billingInterval: "monthly",
    description: "For apps, teams and high-volume fraud screening.",
    features: ["Business API", "5 active API keys", "Usage tracking", "Razorpay autopay"]
  }
};

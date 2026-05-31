import { z } from "zod";

export const checkTypeSchema = z.enum(["URL", "WHATSAPP", "EMAIL", "JOB_OFFER", "LOAN_OFFER", "CRYPTO_INVESTMENT", "SHOPPING_SELLER", "QR_TEXT", "SCREENSHOT_TEXT", "OTHER"]);

export const checkInputSchema = z.object({
  type: checkTypeSchema,
  input: z.string().trim().min(8, "Paste at least 8 characters.").max(6000, "Input is too long. Keep it under 6000 characters.")
});

export const reportSchema = z.object({
  checkId: z.string().cuid().optional(),
  scamType: z.string().trim().min(2).max(80),
  platform: z.string().trim().min(2).max(80),
  country: z.string().trim().min(2).max(80),
  description: z.string().trim().min(20).max(3000),
  screenshotUrl: z.string().url().optional().or(z.literal("")),
  isPublic: z.coerce.boolean().optional().default(false)
});

export const feedbackSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().trim().min(10).max(2000),
  rating: z.coerce.number().int().min(1).max(5).optional()
});

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128).regex(/[A-Z]/, "Use one uppercase letter.").regex(/[0-9]/, "Use one number.")
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});


export const apiKeyCreateSchema = z.object({
  name: z.string().trim().min(2, "Use a clear key name.").max(80)
});

export const planSchema = z.enum(["PRO", "FAMILY", "BUSINESS"]);

export const billingRequestSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  plan: planSchema,
  message: z.string().trim().max(1200).optional().or(z.literal(""))
});


export const alertSubscriptionSchema = z.object({
  email: z.string().email(),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  scamTypes: z.array(z.string().trim().min(2).max(60)).max(8).optional().default([]),
  frequency: z.enum(["daily", "weekly", "critical_only"]).default("weekly"),
  source: z.string().trim().max(80).optional().default("alerts")
});

export const integrationLeadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  useCase: z.string().trim().min(12).max(1200),
  volume: z.string().trim().max(80).optional().or(z.literal("")),
  source: z.string().trim().max(80).optional().default("website")
});


export const razorpayPlanSchema = z.object({
  plan: planSchema
});

export const razorpayOrderVerifySchema = z.object({
  razorpay_order_id: z.string().min(8),
  razorpay_payment_id: z.string().min(8),
  razorpay_signature: z.string().min(20)
});

export const razorpaySubscriptionVerifySchema = z.object({
  razorpay_subscription_id: z.string().min(8),
  razorpay_payment_id: z.string().min(8),
  razorpay_signature: z.string().min(20)
});

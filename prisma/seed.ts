import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin@123456";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "TrustCheck Admin",
      role: "ADMIN",
      passwordHash: await hashPassword(password)
    }
  });

  const publicReportCount = await prisma.scamReport.count({ where: { isPublic: true, status: "approved" } });
  if (publicReportCount === 0) {
    await prisma.scamReport.createMany({
      data: [
        {
          publicSlug: "fake-kyc-phishing-sms-whatsapp-india",
          scamType: "Fake KYC phishing",
          platform: "SMS / WhatsApp",
          country: "India",
          description: "Message claimed a bank account would be blocked and pushed a suspicious KYC link with urgent wording.",
          isPublic: true,
          status: "approved",
          upvotes: 18,
          views: 142
        },
        {
          publicSlug: "fake-job-task-scam-telegram-india",
          scamType: "Fake job task scam",
          platform: "Telegram",
          country: "India",
          description: "Sender offered daily income for liking videos, then asked for a prepaid task deposit before releasing earnings.",
          isPublic: true,
          status: "approved",
          upvotes: 23,
          views: 196
        },
        {
          publicSlug: "delivery-fee-phishing-email-united-states",
          scamType: "Delivery fee phishing",
          platform: "Email",
          country: "United States",
          description: "Email said a package was delayed and requested a small redelivery fee through a non-official tracking domain.",
          isPublic: true,
          status: "approved",
          upvotes: 11,
          views: 88
        },
        {
          publicSlug: "crypto-investment-scam-instagram-united-kingdom",
          scamType: "Crypto investment scam",
          platform: "Instagram",
          country: "United Kingdom",
          description: "Profile promised guaranteed daily crypto profit and asked users to move funds to an unknown wallet address.",
          isPublic: true,
          status: "approved",
          upvotes: 15,
          views: 107
        }
      ],
      skipDuplicates: true
    });
  }



  const alertCount = await prisma.alertSubscription.count();
  if (alertCount === 0) {
    await prisma.alertSubscription.createMany({
      data: [
        { email: "alerts-demo@trustcheck.local", country: "India", scamTypes: ["Phishing", "Fake job", "KYC"], frequency: "weekly", source: "seed" },
        { email: "business-demo@trustcheck.local", country: "United States", scamTypes: ["Shopping fraud", "Delivery"], frequency: "critical_only", source: "seed" }
      ],
      skipDuplicates: true
    });
  }

  const leadCount = await prisma.integrationLead.count();
  if (leadCount === 0) {
    await prisma.integrationLead.createMany({
      data: [
        { name: "Demo Marketplace", email: "marketplace-demo@trustcheck.local", company: "Demo Marketplace", useCase: "We want to check seller links and suspicious payment requests before users leave our marketplace.", volume: "5k checks/month", source: "trust_widget" },
        { name: "Demo Extension User", email: "extension-demo@trustcheck.local", company: "Independent", useCase: "I want one-click scam checks on WhatsApp Web, Gmail and job portals.", volume: "Personal use", source: "browser_extension" }
      ]
    });
  }

  console.log(`Admin ready: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());

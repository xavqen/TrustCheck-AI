export const BLOG_POSTS = [
  {
    slug: "detect-whatsapp-scams",
    title: "How to detect WhatsApp scams",
    description: "Learn the red flags in viral WhatsApp forwards, fake KYC alerts and urgent money messages.",
    category: "WhatsApp safety",
    sections: [
      { heading: "Watch urgency language", body: "Scam messages often say your account will close, reward will expire or action is needed in minutes. Slow down and verify outside WhatsApp." },
      { heading: "Never share OTP or PIN", body: "Banks, delivery companies and government services do not ask for OTP, CVV, UPI PIN or passwords in chat." },
      { heading: "Verify links", body: "Look at the real domain, not the logo or message design. Use bookmarks or official apps for account actions." }
    ]
  },
  {
    slug: "detect-fake-job-offers",
    title: "How to detect fake job offers",
    description: "Understand fake HR messages, task scams, registration fees and unrealistic work-from-home offers.",
    category: "Job scams",
    sections: [
      { heading: "Fees are a red flag", body: "Real employers do not ask candidates to pay interview fees, laptop deposits, training kit fees or refundable verification charges." },
      { heading: "Check company domain", body: "Official recruiters usually email from a real company domain, not random free email accounts or only Telegram." },
      { heading: "Question instant offers", body: "High salary for simple tasks with no interview is a common trap used in task and review scams." }
    ]
  },
  {
    slug: "check-phishing-links",
    title: "How to check phishing links",
    description: "A practical guide to spotting shortened links, lookalike domains, fake login pages and risky redirects.",
    category: "Phishing",
    sections: [
      { heading: "Read the domain backwards", body: "The important part is the registered domain before the final extension. Attackers use subdomains to hide fake pages." },
      { heading: "Beware brand lookalikes", body: "Extra words, hyphens, misspellings and unusual extensions can indicate fake brand pages." },
      { heading: "Avoid login from messages", body: "For banking, crypto and email, open the official app or bookmarked website instead of clicking message links." }
    ]
  },
  {
    slug: "avoid-crypto-scams",
    title: "How to avoid crypto scams",
    description: "Spot fake airdrops, wallet drainers, guaranteed-profit schemes and seed phrase theft.",
    category: "Crypto",
    sections: [
      { heading: "No guaranteed profit", body: "Any crypto offer promising fixed daily returns, doubled money or risk-free trading is suspicious." },
      { heading: "Protect seed phrases", body: "Never paste seed phrases, private keys or recovery codes into websites, chats or support forms." },
      { heading: "Verify contracts and links", body: "Use official project channels and independently verify websites before connecting a wallet." }
    ]
  },
  {
    slug: "report-online-fraud",
    title: "How to report online fraud",
    description: "What evidence to save and where to report scams after you detect a suspicious incident.",
    category: "Reporting",
    sections: [
      { heading: "Save evidence", body: "Keep screenshots, phone numbers, account IDs, payment references, URLs, chat exports and timestamps." },
      { heading: "Contact your bank quickly", body: "If money moved, contact your bank or payment app immediately and request fraud support." },
      { heading: "Report on platforms", body: "Report the sender, seller, fake page or listing inside the platform so others are protected." }
    ]
  }
] as const;

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { PwaRegister } from "@/components/pwa/pwa-register";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "TrustCheck AI - Scam Detection for Links, Messages and Offers",
    template: "%s | TrustCheck AI"
  },
  description: "Check suspicious links, WhatsApp messages, emails, QR codes, job offers, loan offers, shopping sellers, crypto offers and scam screenshots with TrustCheck AI.",
  keywords: ["scam checker", "phishing link checker", "whatsapp scam", "crypto scam", "fake job checker", "online fraud"],
  authors: [{ name: "TrustCheck AI" }],
  verification: {
    google: "t6vNWWPIElU-JxUI1qO1MUARshpmRQGlZrRC2oVNFqU", // Paste the code you copied from Google
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
  },
  openGraph: {
    title: "TrustCheck AI",
    description: "AI-powered global scam detection for links, messages and offers.",
    url: "/",
    siteName: "TrustCheck AI",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustCheck AI",
    description: "AI-powered global scam detection for links, messages and offers."
  }
};

export const viewport: Viewport = {
  themeColor: "#0EA5E9",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1 overflow-x-hidden pb-24 md:pb-0">{children}</main>
            <SiteFooter />
            <MobileBottomNav />
          </div>
          <PwaRegister />
          <Toaster richColors closeButton position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

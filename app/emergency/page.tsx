import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Banknote, ClipboardCheck, KeyRound, PhoneCall, ShieldAlert } from "lucide-react";
import { COUNTRY_GUIDES } from "@/lib/intel/country-guidance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Emergency Scam Checklist",
  description: "Step-by-step actions to take if you clicked a scam link, shared OTP/password, or lost money online."
};

const steps = [
  { icon: Banknote, title: "Freeze money movement", text: "Call your bank, card issuer, wallet or exchange. Ask to freeze cards/accounts, stop payments, and create a fraud ticket." },
  { icon: KeyRound, title: "Lock accounts", text: "Change passwords from a clean device, log out of all sessions, remove unknown recovery emails/devices, and turn on 2FA." },
  { icon: PhoneCall, title: "Stop contact", text: "Do not negotiate with the scammer. Block them only after saving screenshots, phone numbers, links and payment details." },
  { icon: ClipboardCheck, title: "Preserve evidence", text: "Keep transaction IDs, chat exports, email headers, QR text, wallet addresses, seller profiles and timestamps." },
  { icon: ShieldAlert, title: "Report fast", text: "Use official cybercrime, police, platform and bank channels. Early reporting improves payment freeze chances." }
];

export default function EmergencyPage() {
  return (
    <div className="container-px mx-auto max-w-6xl py-10">
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/20 md:p-10">
        <Badge variant="danger">Emergency mode</Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Clicked a scam link or lost money?</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">Act in this order: freeze money, secure accounts, preserve evidence, then report. Do not send more money to “recover” the first payment.</p>
        <div className="mt-6 responsive-actions">
          <Button asChild variant="destructive"><Link href="/report">Create scam report</Link></Button>
          <Button asChild variant="outline"><Link href="/checker">Check message/link first</Link></Button>
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {steps.map((step, index) => (
          <Card key={step.title}>
            <CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><step.icon className="size-7 text-red-600" /><span className="text-sm font-bold text-muted-foreground">0{index + 1}</span></div><CardTitle className="text-lg">{step.title}</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{step.text}</CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader><CardTitle>What not to do</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {["Do not share OTP, PIN, CVV, seed phrase or screen-share access.", "Do not pay recovery fees, tax release fees, courier fees or verification fees.", "Do not delete chats before saving screenshots and export files."].map((item) => (
            <div key={item} className="flex gap-3 rounded-2xl border p-4 text-sm"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" /> {item}</div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader><CardTitle>Country-specific first action</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {COUNTRY_GUIDES.map((guide) => (
            <div key={guide.code} className="rounded-2xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">{guide.country}</h2><Badge variant="outline">{guide.code}</Badge></div>
              <p className="mt-3 text-sm text-muted-foreground">{guide.emergency}</p>
              <ul className="mt-3 list-inside list-disc text-xs text-muted-foreground">
                {guide.evidence.slice(0, 4).map((item) => <li key={item} className="break-anywhere">{item}</li>)}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

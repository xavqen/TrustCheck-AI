import Link from "next/link";
import { Code2, KeyRound, ShieldCheck, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const curlExample = `curl -X POST https://your-domain.com/api/v1/check \\
  -H "Authorization: Bearer tc_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"URL","input":"https://fake-bank-verify.example.com/kyc"}'`;


const urlInspectExample = String.raw`curl -X POST https://your-domain.com/api/url/inspect \
  -H "Content-Type: application/json" \
  -d '{"text":"https://support-bank-verify.example/kyc"}'`;

const intelExample = `curl https://your-domain.com/api/intel/summary?days=30`;

const publicReportsExample = `curl "https://your-domain.com/api/public/reports?country=India&type=Phishing&limit=20"`;

const publicStatsExample = `curl https://your-domain.com/api/public/stats`;

const publicVoteExample = `curl -X POST https://your-domain.com/api/public/reports/fake-job-task-scam-telegram-india/vote`;

const alertSubscribeExample = String.raw`curl -X POST https://your-domain.com/api/alerts/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","country":"India","scamTypes":["Phishing","Fake job"],"frequency":"weekly"}'`;


const razorpayOrderExample = String.raw`curl -X POST https://your-domain.com/api/razorpay/order \
  -H "Content-Type: application/json" \
  -d '{"plan":"PRO"}'`;

const razorpaySubscriptionExample = String.raw`curl -X POST https://your-domain.com/api/razorpay/subscription \
  -H "Content-Type: application/json" \
  -d '{"plan":"BUSINESS"}'`;

const razorpayWebhookUrl = `https://your-domain.com/api/razorpay/webhook`;

const razorpayCancelExample = String.raw`curl -X POST https://your-domain.com/api/billing/subscription/cancel \
  -H "Content-Type: application/json" \
  -d '{"immediate":false}'`;

const razorpaySyncExample = String.raw`curl -X POST https://your-domain.com/api/billing/subscription/sync`;

const invoicesExample = `curl https://your-domain.com/api/billing/invoices`;

const leadCaptureExample = String.raw`curl -X POST https://your-domain.com/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo","email":"demo@example.com","company":"Acme","useCase":"We want to check seller links before users open them.","volume":"1000/month","source":"trust_widget"}'`;

const brandInspectExample = String.raw`curl -X POST https://your-domain.com/api/brand/inspect \
  -H "Content-Type: application/json" \
  -d '{"input":"SBI KYC blocked verify at https://sbi-kyc-secure.example.com"}'`;

const responseExample = `{
  "id": "check_id",
  "shareToken": "public_share_token",
  "riskLevel": "DANGEROUS",
  "trustScore": 18,
  "redFlags": ["Urgency pressure", "Lookalike brand domain"],
  "recommendedAction": "Do not click or share personal information."
}`;


const steps: { title: string; description: string; icon: LucideIcon }[] = [
  { title: "Activate Business", description: "Pay for Business in Billing, then create a key from Settings after activation.", icon: KeyRound },
  { title: "Send request", description: "Call /api/v1/check with Bearer auth.", icon: Code2 },
  { title: "Use result", description: "Store risk level, score and guidance.", icon: ShieldCheck }
];

export default function ApiDocsPage() {
  return (
    <section className="container-px mx-auto max-w-5xl py-10">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-medium text-primary">Business API</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Scam check API documentation</h1>
        <p className="mt-3 text-muted-foreground">Connect TrustCheck AI to your support inbox, marketplace, browser extension or fraud monitoring tool. The saved API requires an active Business plan or admin account.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return <Card key={step.title}><CardHeader><Icon className="size-7 text-primary" /><CardTitle>{step.title}</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{step.description}</CardContent></Card>;
        })}
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Request</CardTitle></CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100"><code>{curlExample}</code></pre>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle>Response</CardTitle></CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100"><code>{responseExample}</code></pre>
        </CardContent>
      </Card>


      <Card className="mt-6">
        <CardHeader><CardTitle>URL-only inspector</CardTitle></CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">Use this lightweight endpoint when you only need visible link signals without saving a full scam check.</p>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100"><code>{urlInspectExample}</code></pre>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle>Brand impersonation inspector</CardTitle></CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">Use this endpoint to detect brand-name abuse and suspicious domains before running a full saved scam check.</p>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100"><code>{brandInspectExample}</code></pre>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle>Threat intelligence summary</CardTitle></CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">Use this endpoint for anonymized charts, internal dashboards or public alert widgets.</p>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100"><code>{intelExample}</code></pre>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle>Public scam database endpoints</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Read anonymized community reports and public aggregate stats. These endpoints do not expose user accounts, emails, screenshot URLs, or private check inputs.</p>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100"><code>{publicReportsExample}</code></pre>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100"><code>{publicStatsExample}</code></pre>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100"><code>{publicVoteExample}</code></pre>
        </CardContent>
      </Card>



      <Card className="mt-6">
        <CardHeader><CardTitle>Growth and alert endpoints</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Use these endpoints to capture alert subscribers, browser extension waitlist users and B2B trust widget/API leads.</p>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100"><code>{alertSubscribeExample}</code></pre>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100"><code>{leadCaptureExample}</code></pre>
        </CardContent>
      </Card>


      <Card className="mt-6">
        <CardHeader><CardTitle>Razorpay billing and autopay</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Use these routes for Razorpay Checkout. The subscription route creates a Razorpay monthly plan when needed, then creates an autopay subscription. Configure the webhook URL in Razorpay Dashboard as shown below.</p>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100"><code>{razorpayOrderExample}</code></pre>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100"><code>{razorpaySubscriptionExample}</code></pre>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100"><code>{razorpayWebhookUrl}</code></pre>
          <p className="text-sm text-muted-foreground">v14 customer billing controls:</p>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100"><code>{razorpayCancelExample}</code></pre>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100"><code>{razorpaySyncExample}</code></pre>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100"><code>{invoicesExample}</code></pre>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild><Link href="/billing?plan=BUSINESS">Pay Business plan</Link></Button>
        <Button asChild variant="outline"><Link href="/settings">Manage API keys</Link></Button>
        <Button asChild variant="outline"><Link href="/scam-database">View scam database</Link></Button>
      </div>
    </section>
  );
}

# TrustCheck AI

TrustCheck AI is a global scam-detection SaaS web app built with Next.js 15, TypeScript, Tailwind CSS, Prisma, PostgreSQL/Supabase, Auth.js, Zod, React Hook Form, Recharts, Framer Motion, and server-side AI calls.

## What is included

- Mobile-first responsive landing page
- Scam checker for URLs, WhatsApp messages, emails, job offers, loan offers, crypto/investment offers, shopping sellers, QR text, and screenshot OCR text
- Local scam-detection engine with optional OpenAI/Gemini server-side AI
- URL risk signals: HTTPS, shorteners, lookalike domains, risky TLDs, suspicious keywords, raw IPs, malformed URLs
- Auth.js credentials login/signup
- Protected user dashboard with checks, risk chart, saved reports, public result sharing, TXT reports, and CSV export
- Protected admin dashboard with recent reports, feedback, billing approvals, stats, and abuse-monitoring API
- Business API with API key creation, revocation, usage tracking, billing guard, and `/api/v1/check`
- Public shareable result cards with private input hidden
- Global threat map, anonymized live alerts, emergency scam checklist and country reporting directory
- URL-only signal inspector API and page for quick link triage
- Brand impersonation checker with watched brand/domain signals
- SEO scam playbook library and country-wise reporting directory
- Report scam form with quick scam-type chips, linked check reports, private reports, and optional anonymous public sharing
- Public scam database with responsive search, country/platform/type filters, anonymized report cards, report detail pages, helpful voting, moderation workflow, and public stats APIs
- Blog, SEO metadata, sitemap, robots, manifest/PWA metadata, legal pages, billing page, API docs and security page
- Rate limiting, Zod validation, input sanitization, secure headers, middleware protection
- New professional TrustCheck AI logo system, dark mode, active mobile bottom nav, loading/error/not-found pages, toast states, empty states
- Onboarding checklist page, improved checker UX, clipboard paste helper, trust-score meter, active mobile quick nav, and stronger responsive desktop/mobile polish
- v15 responsiveness hardening: safer buttons, card padding, header/footer, mobile nav, dashboard, billing, public database, admin, tools and long-text overflow protection

## Folder structure

```txt
trustcheck-ai/
├── app/
│   ├── api/
│   │   ├── admin/stats/
│   │   ├── admin/abuse/
│   │   ├── api-keys/[id]/
│   │   ├── api-keys/usage/
│   │   ├── api-keys/
│   │   ├── auth/[...nextauth]/
│   │   ├── billing/request/
│   │   ├── brand/inspect/
│   │   ├── check/[id]/download/
│   │   ├── check/[id]/
│   │   ├── check/
│   │   ├── feedback/
│   │   ├── health/
│   │   ├── intel/summary/
│   │   ├── public/reports/[id]/vote/
│   │   ├── public/reports/
│   │   ├── public/stats/
│   │   ├── url/inspect/
│   │   ├── history/export/
│   │   ├── history/
│   │   ├── report/
│   │   ├── user/usage/
│   │   └── v1/check/
│   ├── admin/billing/
│   ├── admin/reports/
│   ├── admin/
│   ├── billing/
│   ├── blog/[slug]/
│   ├── checker/
│   ├── onboarding/
│   ├── dashboard/
│   ├── docs/api/
│   ├── threat-map/
│   ├── alerts/
│   ├── emergency/
│   ├── tools/url-inspector/
│   ├── tools/brand-inspector/
│   ├── scam-types/[slug]/
│   ├── scam-database/[id]/
│   ├── scam-database/
│   ├── reporting-directory/
│   ├── result/[token]/
│   ├── report/
│   ├── settings/
│   ├── security/
│   ├── login/
│   ├── signup/
│   ├── privacy/
│   ├── terms/
│   ├── disclaimer/
│   ├── about/
│   ├── contact/
│   ├── error.tsx
│   ├── loading.tsx
│   ├── manifest.ts
│   ├── not-found.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── auth/
│   ├── checker/
│   ├── onboarding/
│   ├── dashboard/
│   ├── forms/
│   ├── billing/
│   ├── admin/
│   ├── layout/
│   ├── onboarding/
│   ├── home/
│   ├── intel/
│   ├── tools/
│   ├── settings/
│   └── ui/
├── lib/
│   ├── content/
│   ├── scam/
│   ├── intel/
│   ├── api-key.ts
│   ├── auth.ts
│   ├── plans.ts
│   ├── plan-config.ts
│   ├── csv.ts
│   ├── env.ts
│   ├── password.ts
│   ├── prisma.ts
│   ├── rate-limit.ts
│   ├── sanitize.ts
│   ├── utils.ts
│   └── validation.ts
├── prisma/schema.prisma
├── prisma/seed.ts
├── public/icon.svg
├── public/brand/trustcheck-logo.svg
├── public/brand/trustcheck-mark.svg
├── public/brand/trustcheck-selected-logo.png
├── types/next-auth.d.ts
├── middleware.ts
├── .env.example
├── package.json
└── tsconfig.json
```

## v11 update notes

- Added public scam report detail pages at `/scam-database/[id]`.
- Added helpful voting for approved public reports through `POST /api/public/reports/[id]/vote`.
- Added admin report moderation queue at `/admin/reports`.
- Added admin moderation APIs: approve, reject, and hide public reports.
- New public reports are sanitized and sent to `pending_review` before appearing publicly.
- Added report views, upvotes, public slugs, moderation fields, and vote tracking models in Prisma.
- Public scam database now sorts by helpful reports first and links each card to a detail page.
- Updated PWA cache to `trustcheck-ai-v11`.

## Installation commands

```bash
npm install
cp .env.example .env
```

Windows PowerShell:

```powershell
npm install
copy .env.example .env
```

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Paste it into `AUTH_SECRET` in `.env`.

## Environment setup

For local development, set a PostgreSQL/Supabase connection string:

```env
DATABASE_URL="postgresql://postgres:password@host:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:password@host:5432/postgres"
AUTH_SECRET="paste-generated-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AI_PROVIDER="local"
ADMIN_EMAIL="your@email.com"
SEED_ADMIN_PASSWORD="Admin@123456"
```

AI is optional. If `AI_PROVIDER=local`, the app uses the built-in heuristic engine. To use server-side AI:

```env
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-your-key"
```

or:

```env
AI_PROVIDER="gemini"
GEMINI_API_KEY="your-gemini-key"
```

## Database setup

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

The seed command creates an admin user from `ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.

## Run commands

```bash
npm run dev
```

Open `http://localhost:3000`.

For production build:

```bash
npm run build
npm run start
```

## Business API

Business API requires an active Business plan or admin account. Request a plan in `/billing`; an admin can approve it from `/admin/billing`. After approval, create a key in `/settings`, then call:

```bash
curl -X POST http://localhost:3000/api/v1/check \
  -H "Authorization: Bearer tc_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"type":"URL","input":"https://fake-bank-verify.example.com/kyc"}'
```

Notes:

- API keys are shown only once.
- Revoked keys stop working immediately.
- The API endpoint requires an active Business plan or an admin user.
- Usage is recorded in `ApiUsage`.

## Deployment guide

1. Push this folder to GitHub.
2. Import the repo in Vercel.
3. Add all environment variables from `.env.example`.
4. Use Supabase PostgreSQL for `DATABASE_URL` and `DIRECT_URL`.
5. Run `npm run db:push` locally or through your deployment workflow before first production use.
6. Deploy.

## Main routes

- `/` Home page
- `/checker` Scam checker
- `/result/[token]` Public shareable result card
- `/dashboard` User dashboard
- `/settings` User settings, export, billing link and API keys
- `/billing` Plan usage, limits and upgrade requests
- `/docs/api` Business API docs
- `/security` Security model
- `/threat-map` Global scam threat map
- `/alerts` Anonymized live scam alerts
- `/emergency` Emergency scam response checklist
- `/tools/url-inspector` URL signal inspector
- `/tools/brand-inspector` Brand impersonation checker
- `/scam-types` SEO scam playbook library
- `/scam-database` Public anonymized scam report database
- `/scam-database/[id]` Public scam report detail page
- `/admin/reports` Admin public report moderation queue
- `/reporting-directory` Country cybercrime reporting directory
- `/admin` Admin dashboard
- `/admin/billing` Admin billing approvals
- `/report` Report a scam
- `/pricing` Pricing
- `/blog` SEO blog index
- `/login` Login
- `/signup` Sign up
- `/privacy`, `/terms`, `/disclaimer`, `/about`, `/contact`

## API routes

- `POST /api/check`
- `GET /api/check/[id]`
- `GET /api/check/[id]/download`
- `GET /api/history`
- `GET /api/history/export`
- `POST /api/report`
- `POST /api/feedback`
- `GET /api/api-keys`
- `POST /api/api-keys`
- `GET /api/api-keys/usage`
- `DELETE /api/api-keys/[id]`
- `POST /api/v1/check`
- `GET /api/admin/stats`
- `GET /api/admin/abuse`
- `GET /api/user/usage`
- `GET /api/health`
- `GET /api/intel/summary`
- `GET /api/public/reports`
- `GET /api/public/stats`
- `POST /api/url/inspect`
- `POST /api/brand/inspect`
- `POST /api/billing/request`
- `POST /api/admin/billing/[id]/approve`
- `POST /api/admin/billing/[id]/reject`

## Admin login

After seeding, login with:

```txt
Email: value of ADMIN_EMAIL
Password: value of SEED_ADMIN_PASSWORD
```

Change the password after first production deployment.

## v4 Intelligence layer

This version adds a public intelligence layer without exposing private user inputs:

- `/threat-map` shows 30-day risk trends, country report counts, scam categories and country guidance.
- `/alerts` shows anonymized dangerous-check patterns and recent community reports.
- `/emergency` gives a fast action checklist for users who clicked, paid, or shared credentials.
- `/tools/url-inspector` and `POST /api/url/inspect` perform URL-only signal checks.
- `GET /api/intel/summary?days=30` returns aggregate scam intelligence for dashboards or widgets.

## v5 runtime/PWA fix

If you saw `GET /sw.js 404` in `npm run dev`, this version includes a real `public/sw.js` file and an offline page. Service worker registration only runs in production, so development remains stable.

Browser cleanup if `/sw.js` keeps appearing from an older cached build:

1. Open Chrome DevTools.
2. Go to Application → Service Workers.
3. Click Unregister for `localhost:3000`.
4. Hard refresh with `Ctrl + Shift + R`.

The Recharts deprecation and npm audit lines are warnings, not startup blockers. Do not run `npm audit fix --force` unless you are ready to test breaking dependency changes.

## v6 trust intelligence layer

This version adds more production content and user-facing trust tools:

- `/scam-types` scam playbook library with SEO-friendly scam guides.
- `/scam-types/[slug]` detail pages for WhatsApp KYC, fake jobs, crypto, fake loans, shopping seller fraud, and QR/UPI scams.
- `/tools/brand-inspector` brand impersonation checker for banks, wallets, shopping apps, social platforms and account providers.
- `POST /api/brand/inspect` lightweight brand impersonation API.
- `/reporting-directory` country-wise cybercrime reporting guide using the existing reporting intelligence data.
- Core analyzer now includes brand impersonation signals in normal scam checks.

Brand inspector API example:

```bash
curl -X POST http://localhost:3000/api/brand/inspect \
  -H "Content-Type: application/json" \
  -d '{"input":"SBI KYC blocked. Verify at https://sbi-kyc-secure.example.com"}'
```


## v7 billing and monetization layer

This version adds a working subscription workflow without fake payment placeholders:

- `/billing` shows current plan, daily check usage, API usage and upgrade request form.
- `BillingRequest` Prisma model stores upgrade requests in Supabase.
- `POST /api/billing/request` validates and saves plan requests for logged-in users.
- `/admin/billing` lets admins review pending requests.
- `POST /api/admin/billing/[id]/approve` approves a request, replaces old active subscriptions and creates the new active plan.
- `POST /api/admin/billing/[id]/reject` marks a pending request as rejected.
- API key creation now requires Business plan or admin access.
- `/api/api-keys/usage` returns the user’s recent Business API usage.
- `/api/check` and `/api/user/usage` now use centralized plan limits from `lib/plans.ts`.

After replacing v6 with v7, run:

```bash
npm run db:generate
npm run db:push
npm run dev
```


## v8 branding and responsive polish

This version focuses on the selected professional logo and better mobile/desktop UI behavior:

- Applied the new simple shield-check TrustCheck AI brand direction.
- Added `components/brand-logo.tsx` for crisp scalable header/footer/mobile branding.
- Added public logo assets:
  - `/public/brand/trustcheck-logo.svg`
  - `/public/brand/trustcheck-mark.svg`
  - `/public/brand/trustcheck-selected-logo.png`
  - updated `/public/icon.svg`
- Updated PWA manifest and page metadata icons to use the new brand mark.
- Reworked desktop header navigation to prevent overflow by using primary links plus a compact More menu.
- Improved mobile header with horizontal quick navigation and hidden scrollbar.
- Improved mobile bottom navigation with safe-area padding, stronger tap targets and new brand mark.
- Updated footer layout for cleaner mobile and desktop scanning.
- Added responsive utilities for overflow-safe text, auto-fit card grids and small-screen polish.
- Improved dashboard, admin, settings and API-key layouts so long content does not break mobile screens.

After replacing v7 with v8, run:

```bash
npm run db:generate
npm run db:push
npm run dev
```


## v9 responsive UX layer

This version improved the mobile and desktop product flow:

- `/onboarding` guided first-run checklist.
- Active mobile bottom navigation and active horizontal quick navigation.
- Better checker layout for small screens and desktop cards.
- Clipboard paste helper, input counter, sample scam prompts and trust-score meter.
- Dashboard quick actions and shared-result page polish.
- PWA cache updated to v9.

## v10 community scam database layer

This version adds anonymized community intelligence and more responsive report layouts:

- `/scam-database` searchable public scam database with mobile-first report cards.
- Report form now supports private reports or anonymous public sharing.
- `ScamReport` now has `isPublic` and `status` fields.
- `GET /api/public/reports` returns anonymized reports with filters: `q`, `country`, `type`, `platform`, `limit`, `page`.
- `GET /api/public/stats` returns public aggregate scam counts by type, country and platform.
- Dashboard now labels saved reports as private or public anonymous.
- Header, footer, mobile nav, sitemap and API docs now include the public database.
- Seed script adds safe demo public reports only when the public database is empty.

After replacing v9 with v10, run:

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## v11 public intelligence moderation layer

This version turns the public scam database into a moderated intelligence section:

- `/scam-database/[id]` public scam report detail pages.
- Helpful voting system for public reports.
- `ReportVote` Prisma model.
- Report views, upvotes and public slugs.
- `/admin/reports` moderation dashboard.
- Admin approve, reject and hide APIs.
- Public reports go to `pending_review` before showing publicly.
- Mobile-first public report cards and better detail layouts.

## v12 growth and alert retention layer

This version adds conversion and retention tools around the product:

- `/extension` browser extension waitlist page for future Chrome/browser distribution.
- `/tools/trust-widget` B2B trust widget landing page for marketplaces, job boards and fintech products.
- `/admin/leads` admin inbox for browser extension, widget and API leads.
- `POST /api/alerts/subscribe` saves country/category alert subscriptions.
- `POST /api/leads` saves integration and B2B requests.
- `AlertSubscription` and `IntegrationLead` Prisma models.
- Alerts page now includes a subscription form for daily, weekly or critical-only alerts.
- Header/footer/sitemap updated with the new conversion pages.
- PWA cache updated to v12.

After replacing v11 with v12, run:

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```


## v13 Razorpay + Autopay

This version adds real Razorpay billing flows for paid plans. Users can open `/billing`, choose Pro, Family or Business, then either:

- start monthly autopay using Razorpay Subscriptions, or
- make a one-time 30-day payment using Razorpay Orders.

### Razorpay environment variables

Add these to `.env` before using online payments:

```bash
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret"
```

### Razorpay Dashboard setup

1. Use Razorpay Test Mode first.
2. Add webhook URL: `https://your-domain.com/api/razorpay/webhook`.
3. Enable payment and subscription events, especially `payment.captured`, `payment.failed`, `subscription.authenticated`, `subscription.activated`, `subscription.charged`, `subscription.cancelled`, and `subscription.completed`.
4. Copy the webhook secret into `RAZORPAY_WEBHOOK_SECRET`.
5. After testing, switch to Live Mode keys.

### New routes

- `POST /api/razorpay/order` creates a one-time Razorpay order.
- `POST /api/razorpay/order/verify` verifies the checkout signature and activates 30-day access.
- `POST /api/razorpay/subscription` creates a monthly autopay subscription.
- `POST /api/razorpay/subscription/verify` verifies initial autopay authorization and activates the plan.
- `POST /api/razorpay/webhook` verifies Razorpay webhooks and keeps subscriptions/payment records updated.
- `/admin/payments` shows payment transactions and webhook delivery.

Run after updating files:

```bash
npm run db:generate
npm run db:push
npm run dev
```

## v14 Razorpay subscription management + invoices

This version extends the Razorpay/autopay implementation with safer customer controls and billing records:

- `/billing` now shows an autopay management card.
- Users can sync Razorpay status with `POST /api/billing/subscription/sync`.
- Users can cancel the next autopay renewal with `POST /api/billing/subscription/cancel`.
- `/billing` now shows paid invoice/receipt history.
- `/billing/invoices/[id]` shows a local receipt generated from verified Razorpay payment/webhook data.
- `GET /api/billing/invoices` returns the logged-in user's billing history.
- `BillingInvoice` Prisma model stores local receipt/invoice data.
- Subscription records now store provider status, next billing date, cancellation timestamps and last sync time.
- Webhook events now store processing errors for admin debugging.
- `/admin/payments` now shows invoice capture, webhook errors and cancel-request counts.

Recommended Razorpay webhook events for v14:

```text
payment.authorized
payment.captured
payment.failed
subscription.authenticated
subscription.activated
subscription.charged
subscription.pending
subscription.halted
subscription.paused
subscription.cancelled
subscription.completed
invoice.issued
invoice.paid
invoice.expired
```

Run after replacing v13 with v14:

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```


## v15 responsiveness optimization

This version focuses only on mobile, tablet and desktop layout stability:

- Reworked base UI primitives so buttons, cards, inputs, textareas and selects no longer force overflow on small screens.
- Added global responsive utilities for full-width mobile actions, adaptive stats grids, touch-friendly horizontal scrolling and fluid headings.
- Improved header behavior: compact logo text on small screens, safer auth buttons, scrollable mobile quick nav and overflow-safe More menu.
- Improved footer spacing so the fixed mobile bottom nav does not cover footer links.
- Improved home hero, checker, results, dashboard, billing, Razorpay/autopay, invoice list, settings, API key manager, public scam database, alerts, threat map, emergency page and admin screens.
- Changed heavy two-column layouts to activate later on larger screens, preventing tablet squeeze and card compression.
- Added better long-text handling for URLs, API keys, report descriptions, invoices, payment IDs and scam details.
- Increased touch target consistency for mobile navigation and primary actions.

Run after replacing v14 with v15:

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

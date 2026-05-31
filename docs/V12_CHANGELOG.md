# TrustCheck AI v12 — Growth + Alert Retention Layer

## Added

- `/extension` browser extension waitlist page.
- `/tools/trust-widget` B2B trust widget landing page.
- `/admin/leads` admin inbox for integration leads and alert subscribers.
- `POST /api/alerts/subscribe` alert subscription endpoint.
- `POST /api/leads` integration lead capture endpoint.
- `AlertSubscription` Prisma model.
- `IntegrationLead` Prisma model.
- Reusable alert subscription and lead capture forms.
- Alerts page now includes subscription capture for retention.
- Header, footer, sitemap, manifest and PWA cache updated for v12.
- Seed data for demo alert subscribers and integration leads.

## After replacing v11 with v12

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

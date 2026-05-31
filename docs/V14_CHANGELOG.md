# v14 — Razorpay Subscription Management + Invoices

This version strengthens the v13 Razorpay/autopay layer with customer-facing subscription controls, invoice tracking and more reliable webhook processing.

## Added

- Customer autopay management card on `/billing`.
- Cancel next renewal through `POST /api/billing/subscription/cancel`.
- Sync latest Razorpay subscription status through `POST /api/billing/subscription/sync`.
- User invoice/receipt history on `/billing`.
- Local receipt detail page at `/billing/invoices/[id]`.
- User invoice API: `GET /api/billing/invoices`.
- `BillingInvoice` Prisma model.
- Subscription sync fields: Razorpay status, next billing date, cancellation timestamps and last sync time.
- Webhook processing error storage for easier debugging.
- Admin payments page now shows cancel requests, invoice capture and webhook errors.
- One-time payments now create local paid receipts after signature verification.
- Subscription webhooks now handle pending, halted, paused, cancelled, completed and invoice events more safely.

## Razorpay webhook events to enable

Enable these in Razorpay Dashboard → Account & Settings → Webhooks:

- `payment.authorized`
- `payment.captured`
- `payment.failed`
- `subscription.authenticated`
- `subscription.activated`
- `subscription.charged`
- `subscription.pending`
- `subscription.halted`
- `subscription.paused`
- `subscription.cancelled`
- `subscription.completed`
- `invoice.issued`
- `invoice.paid`
- `invoice.expired`

## Run after upgrade

```bash
npm install
npm run db:generate
npm run db:push
npm run dev
```

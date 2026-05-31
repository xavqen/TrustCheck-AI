# v13 — Razorpay + Autopay

Added Razorpay Checkout integration for one-time paid plan activation and monthly autopay subscriptions.

## Added

- Razorpay order creation API
- Razorpay order signature verification API
- Razorpay subscription/autopay creation API
- Razorpay subscription signature verification API
- Razorpay webhook endpoint with HMAC validation
- Payment transaction database model
- Razorpay plan mapping database model
- Razorpay webhook event idempotency model
- Billing page payment UI
- Admin payments dashboard
- `.env.example` Razorpay keys

## Notes

Use Razorpay Test Mode first. Configure `https://your-domain.com/api/razorpay/webhook` in Razorpay Dashboard and set the same webhook secret in `.env`.

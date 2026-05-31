# v15 Responsiveness Optimization

Focused responsive hardening for TrustCheck AI across mobile, tablet and desktop.

## UI primitive fixes

- Buttons now support wrapped text, full-width mobile actions and safer touch targets.
- Cards now include `min-w-0`, overflow protection and smaller mobile padding.
- Inputs, selects and textareas include `min-w-0` and mobile-friendly heights.
- Badges now avoid layout overflow.

## Layout fixes

- Header no longer crowds small screens.
- Mobile quick navigation uses horizontal snap scrolling.
- Mobile bottom navigation gets safer label sizing and max width.
- Footer has extra bottom spacing on mobile so fixed navigation does not overlap it.
- Main content has horizontal overflow protection and safer bottom padding.

## Page fixes

- Home hero uses fluid heading sizes and mobile-first actions.
- Checker/results layout avoids cramped tablet columns.
- Dashboard history and saved reports are safer on small screens.
- Billing, Razorpay checkout, autopay management and invoice list are mobile-first.
- Scam database filters and cards work better from phone to desktop.
- Admin dashboards and payment/webhook views are safer with long IDs and text.
- Threat map, alerts, emergency, URL inspector and brand inspector layouts are less compressed on tablets.

## Run

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

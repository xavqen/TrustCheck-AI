# TrustCheck AI v10 — Community Scam Database

## Added

- Public scam database page at `/scam-database`.
- Anonymous community report cards optimized for mobile and desktop.
- Search and filters by keyword, country, scam type and platform.
- Public reports API: `GET /api/public/reports`.
- Public stats API: `GET /api/public/stats`.
- Optional anonymous sharing toggle in the scam report form.
- New `ScamReport.isPublic` and `ScamReport.status` fields.
- Dashboard badge showing whether each saved report is private or public anonymous.
- Seed demo public reports when the database has no public entries.

## Updated

- Header, footer, mobile bottom nav and sitemap now link to the scam database.
- API docs include the public database endpoints.
- Home page CTA links to the scam database.
- PWA cache updated to `trustcheck-ai-v10`.

## Run after upgrade

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

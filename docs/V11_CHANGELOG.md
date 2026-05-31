# TrustCheck AI v11 — Public Intelligence & Moderation

## Added

- Public scam report detail pages: `/scam-database/[id]`
- Helpful vote button for approved public reports
- Vote-tracking model with duplicate vote protection
- Public slug, view count, upvote count, moderation metadata on reports
- Admin moderation queue: `/admin/reports`
- Admin actions: approve, reject, hide
- Moderation APIs:
  - `POST /api/admin/reports/[id]/approve`
  - `POST /api/admin/reports/[id]/reject`
  - `POST /api/admin/reports/[id]/hide`
- Public vote API:
  - `POST /api/public/reports/[id]/vote`
- Better scam database cards with details links, views, and helpful counts

## Behavior change

- Public reports submitted by users now enter `pending_review` first.
- Only `approved` public reports appear in the public scam database and public stats.
- Private reports stay visible only in the user's dashboard.

## Database change

Run:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

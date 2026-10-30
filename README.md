# KaamSetu

India-first local services marketplace and provider SaaS.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Neon PostgreSQL (separate project; not yet connected)
- Authentication integration is intentionally gated until separate credentials are provisioned.

## Run locally
```bash
npm install
npm run dev
```

## MVP modules
- Customer service discovery and booking entry points
- Provider onboarding and business workspace entry points
- Admin operations entry point
- PostgreSQL schema in `database/schema.sql`

No demo users, bookings, payments, provider approvals or revenue are seeded. Empty states are shown until real data is connected.

## Deployment
Import this repository into a dedicated Vercel project named `kaamsetu`. Configure `DATABASE_URL` only after creating the dedicated KaamSetu Neon project. Do not reuse credentials from Global Finance, NovoPay, AIJOBS or other production projects.

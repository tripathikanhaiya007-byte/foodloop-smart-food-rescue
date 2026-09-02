# FoodLoop — Smart Food Rescue

FoodLoop is a full-stack social-impact platform that connects hotels, restaurants,
canteens and event venues with verified NGOs. Donors publish safe surplus food,
NGOs reserve and track pickups, and administrators verify organisations before
their operational tools are unlocked.

![FoodLoop food-rescue handover](public/foodloop-rescue-hero.png)

## What the project demonstrates

- Multi-user authentication with Sign in with ChatGPT
- Donor, NGO and administrator roles enforced on the server
- Organisation registration and administrator approval workflow
- Food-safety declarations, allergen details and pickup deadlines
- Live donation inventory and one-organisation pickup ownership
- Collection and delivery status tracking with handover codes
- Automatic impact metrics for meals, food weight and avoided emissions
- User profiles, notifications and responsive role-specific dashboards
- Persistent Cloudflare D1 data with Drizzle ORM migrations
- Idempotent demo-data repair that is safe to run more than once

## How people use FoodLoop

| User | Main workflow |
| --- | --- |
| Hotel / restaurant | Registers its organisation, waits for approval, lists safe surplus food and follows each handover |
| NGO / food bank | Registers and gets verified, discovers suitable donations, reserves a pickup, then records collection and delivery |
| Administrator | Reviews organisation details, approves or rejects accounts, and monitors network activity and impact |

## Tech stack

- Next.js 16, React 19 and TypeScript
- Vinext and Cloudflare Workers
- Cloudflare D1 (SQLite) and Drizzle ORM
- Server-rendered authentication helpers and protected API routes
- Custom responsive CSS and Lucide icons

## Local development

Requirements: Node.js 22.13 or newer, plus a Linux environment with `flock`,
`curl` and GNU `timeout`.

```bash
npm run install:ci
npm run dev
```

The local D1 database and runtime files are created inside ignored project
directories. To make one account the platform administrator, configure the
following server-side environment variable in the deployment environment:

```bash
ADMIN_EMAIL=admin@example.com
```

Do not expose `ADMIN_EMAIL` to browser code. FoodLoop compares it only with the
authenticated request identity on the server.

## Useful commands

```bash
npm run lint
npm run db:generate
npm run build
npm test
```

When `db/schema.ts` changes, run `npm run db:generate` and commit the new file in
`drizzle/`. Existing migrations are intentionally immutable.

## Data model

The main entities are organisations, users, donations, safety checks, pickups,
status events, notifications, impact events and feedback. New user accounts are
`pending` until an administrator approves their linked organisation. Every write
operation re-checks the authenticated user's role, status and organisation on
the server; the client cannot promote itself or switch roles.

## Project status

FoodLoop is a working portfolio prototype with real authentication, persistence
and permission checks. Its food-safety checklist supports coordination and
traceability, but production use would also require local legal review,
organisation-document verification, operational insurance and a formal food
safety policy.

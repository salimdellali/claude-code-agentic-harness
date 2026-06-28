# STATE.md — LinkTo Build State

Track symbol legend: `[ ]` TODO · `[~]` In Progress · `[x]` Done · `[!]` Blocked

Agents: only update your own rows. Read this file before starting any task.

---

## Phase 1: Scaffolding (sequential — must complete before Phase 2)

- [x] A1: Init Next.js 15 with TypeScript + pnpm, configure `tsconfig.json` strict mode
- [x] A2: Install + configure Tailwind CSS v4, wire DESIGN.md tokens into `globals.css`
- [x] A3: Install shadcn/ui, configure `components.json`, add base components (Button, Input, Table, Badge)
- [x] A4: Install all project deps — drizzle-orm, @neondatabase/serverless, drizzle-kit, recharts, qrcode, posthog-js, posthog-node
- [x] A5: Install dev deps — vitest, @vitejs/plugin-react, @vitest/ui, @playwright/test, tsx
- [x] A6: Create `.env.local` with all keys (Neon + Clerk merged) and `.gitignore` entry
- [x] A7: Set up root `app/layout.tsx` with Geist font (Inter substitute) and ClerkProvider

---

## Phase 2: Foundation (parallel — B and C can run simultaneously after Phase 1)

### Agent B — Database
- [x] B1: Write DrizzleORM schema (`src/db/schema.ts`) — Link, Click, Tag, LinksToTags tables
- [x] B2: Set up Neon connection + Drizzle client (`src/db/index.ts`)
- [x] B3: Configure `drizzle.config.ts`
- [x] B4: Run `pnpm drizzle-kit push` to apply schema to Neon
- [x] B5: Write seed script (`src/db/seed.ts`) with sample links and tags

### Agent C — Auth
- [x] C1: Write `src/proxy.ts` — Clerk middleware protecting all routes except `/sign-in`, `/sign-up`, `/[slug]`
- [x] C2: Create sign-in page `app/sign-in/[[...sign-in]]/page.tsx`
- [x] C3: Create sign-up page `app/sign-up/[[...sign-up]]/page.tsx`
- [x] C4: Write `src/lib/auth.ts` — `getCurrentUserId()` helper that throws 401 if not authed

---

## Phase 3: Backend APIs (parallel — D, E, F, G can run simultaneously after B is done)

### Agent D — Redirect Handler
- [x] D1: `app/[slug]/route.ts` — look up slug, log Click (referrer, country from `x-vercel-ip-country`, device from UA), redirect
- [x] D2: Handle expiry — 302 for expiring links, 301 for permanent
- [x] D3: `app/not-found.tsx` — styled 404 page for missing/expired slugs

### Agent E — Link API
- [x] E1: `src/lib/slug.ts` — adjective-noun slug generator (e.g. `fast-cloud`), collision retry logic
- [x] E2: `POST /api/links/route.ts` — create link, auto-fetch page `<title>`, generate slug, assign tags
- [x] E3: `DELETE /api/links/[id]/route.ts` — delete link (verify ownership)
- [x] E4: `PATCH /api/links/[id]/route.ts` — update title, tags, expiresAt

### Agent F — Analytics API
- [x] F1: `GET /api/links/[id]/analytics/route.ts` — return total clicks, clicks per day (last 30d), top 5 referrers, country breakdown

### Agent G — QR API
- [x] G1: `GET /api/links/[id]/qr/route.ts` — generate QR PNG from short URL, return as `image/png`

---

## Phase 4: Frontend UI (parallel — H, I, J, K can run simultaneously after E, F, G are done)

### Agent H — Dashboard
- [x] H1: `app/(dashboard)/layout.tsx` — sidebar shell with nav links (Dashboard, New Link, Tags)
- [x] H2: `app/(dashboard)/dashboard/page.tsx` — link table with slug, URL, click count, tags, created date
- [x] H3: Tag filter pills above table, sort by clicks or date
- [x] H4: Row actions — copy short URL to clipboard, open QR modal, delete with confirm

### Agent I — Link Creation Form
- [x] I1: `app/(dashboard)/links/new/page.tsx` — form: URL input, optional custom slug, optional expiry date, tag multi-select
- [x] I2: Client-side validation (valid URL, slug format), submit to `POST /api/links`
- [x] I3: Redirect to dashboard on success with toast notification

### Agent J — Analytics Page
- [x] J1: `app/(dashboard)/links/[id]/page.tsx` — stat cards (total, 7d, 30d clicks)
- [x] J2: Recharts `LineChart` — clicks per day (30d), violet `#5757f8` stroke
- [x] J3: Recharts `BarChart` — top 5 referrers
- [x] J4: Country breakdown table
- [x] J5: QR code display + "Download PNG" button

### Agent K — Tags Page
- [x] K1: `app/(dashboard)/tags/page.tsx` — list all tags with link counts
- [x] K2: Create tag (inline form), rename tag (inline edit), delete tag with confirm

---

## Phase 5: Observability (after Phase 4)

- [x] L1: Wire PostHog provider in `app/layout.tsx` with `NEXT_PUBLIC_POSTHOG_KEY`
- [x] L2: Track `link_created` event in `POST /api/links`
- [x] L3: Track `link_clicked` event in `app/[slug]/route.ts`

---

## Phase 6: Tests (after Phase 3 + Phase 4)

- [x] M1: Vitest unit — `src/__tests__/unit/slug.test.ts` (slug generation, uniqueness, format)
- [x] M2: Vitest unit — `src/__tests__/unit/analytics.test.ts` (aggregation helpers)
- [x] M3: Vitest integration — `src/__tests__/integration/links.test.ts` (POST/DELETE/PATCH API routes)
- [x] M4: Vitest integration — `src/__tests__/integration/analytics.test.ts` (analytics aggregation queries)
- [x] M5: Playwright E2E — `e2e/create-link.spec.ts` (sign in → create link → copy → verify redirect)
- [x] M6: Playwright E2E — `e2e/analytics.spec.ts` (view analytics page, charts render)

---

## Phase 7: CI/CD (after Phase 6)

- [x] N1: `.github/workflows/ci.yml` — triggers on PR to `staging` and `prod`: pnpm install → tsc → eslint → vitest
- [x] N2: `.github/workflows/e2e.yml` — triggers on merge to `staging`: Playwright E2E
- [x] N3: `vercel.json` or project config — `staging` branch → Vercel preview, `prod` branch → `linkto.vercel.app`

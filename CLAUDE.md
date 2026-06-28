# CLAUDE.md — LinkTo Agent Contract

Every agent must read this file before touching any code, then read STATE.md to check task status.

---

## Project Summary

LinkTo is a personal URL shortener with click analytics. Users create short human-readable links (e.g. `linkto.vercel.app/fast-cloud`), track clicks with referrer/country/device data, organize links with tags, and download QR codes. Built as a Next.js 15 monolith deployed on Vercel Hobby.

---

## Tech Stack

| Package | Version / Notes |
|---|---|
| Next.js | 15 (App Router, TypeScript strict) |
| DrizzleORM | latest — schema at `src/db/schema.ts` |
| Neon | serverless PostgreSQL via `@neondatabase/serverless` |
| Clerk | `@clerk/nextjs` — auth, middleware, session |
| Tailwind CSS | v4 |
| shadcn/ui | component library — use `sonner` for toasts (not `toast`, which is deprecated) |
| Recharts | charts |
| `qrcode` | server-side QR PNG generation |
| PostHog | `posthog-js` + `posthog-node` — analytics + error tracking |
| Vitest | unit + integration tests |
| Playwright | E2E tests |
| pnpm | **only** package manager — never use npm or yarn |

---

## File Structure

```
src/
  app/
    [slug]/
      route.ts              # Agent D — redirect handler + Click log
    (auth)/
      sign-in/[[...sign-in]]/page.tsx
      sign-up/[[...sign-up]]/page.tsx
    (dashboard)/
      layout.tsx            # sidebar shell
      dashboard/page.tsx    # Agent H — link table
      links/
        new/page.tsx        # Agent I — create form
        [id]/page.tsx       # Agent J — analytics page
      tags/page.tsx         # Agent K — tag management
    api/
      links/
        route.ts            # Agent E — POST /api/links
        [id]/
          route.ts          # Agent E — DELETE, PATCH
          analytics/
            route.ts        # Agent F — GET analytics
          qr/
            route.ts        # Agent G — GET QR PNG
    layout.tsx              # root layout + PostHog provider
    not-found.tsx
  db/
    index.ts                # Agent B — Neon + Drizzle client
    schema.ts               # Agent B — Link, Click, Tag tables
  lib/
    auth.ts                 # Agent C — getCurrentUserId()
    slug.ts                 # Agent E — adjective-noun generator
  middleware.ts             # Agent C — Clerk route protection
  components/
    ui/                     # shadcn/ui components
e2e/                        # Agent M — Playwright tests
src/__tests__/
  unit/                     # Agent M — Vitest unit tests
  integration/              # Agent M — Vitest integration tests
.github/
  workflows/
    ci.yml                  # Agent N — lint + typecheck + vitest
    e2e.yml                 # Agent N — Playwright on staging merge
```

---

## Environment Variables

All agents expect these in `.env.local`:

```env
DATABASE_URL=                              # Neon connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## Conventions

- **pnpm only** — never run `npm install` or `yarn add`
- **TypeScript strict** — no `any`, no type assertions unless genuinely unavoidable
- **No comments** — self-documenting code only; comment the WHY if truly non-obvious, never the WHAT
- **No shadows** — all depth via borders (`1px solid #202020`), never `box-shadow`
- **8px border-radius** — all cards, buttons, inputs; `9999px` for pills only
- **No placeholder implementations** — if you can't finish a task, add `// TODO(agent-X): description` in code and mark `[!]` in STATE.md

---

## DrizzleORM Patterns

```ts
// Import
import { db } from '@/db'
import { links, clicks, tags, linksToTags } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'

// Query example
const userLinks = await db
  .select()
  .from(links)
  .where(eq(links.userId, userId))
  .orderBy(desc(links.createdAt))
```

Migration commands:
- Dev (schema push): `pnpm drizzle-kit push`
- Prod (migration files): `pnpm drizzle-kit migrate`
- Generate migration: `pnpm drizzle-kit generate`

---

## Clerk Auth Patterns

```ts
// In Server Components and API Routes
import { auth } from '@clerk/nextjs/server'

const { userId } = await auth()
if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
```

Use the `getCurrentUserId()` helper from `src/lib/auth.ts` in API routes — it throws a 401 Response if not authenticated, so you can just `await getCurrentUserId()` without an if-check.

Middleware at `src/middleware.ts` protects all routes under `/(dashboard)` and `/api/links`. The `/(auth)` group and `/[slug]` redirect are public.

---

## API Route Conventions

```ts
// Success
return Response.json({ data: result })

// Error
return Response.json({ error: 'Human-readable message' }, { status: 400 })

// Pattern for all protected routes
export async function POST(req: Request) {
  const userId = await getCurrentUserId()  // throws 401 if not authed
  const body = await req.json()
  // ...
  return Response.json({ data: result })
}
```

---

## UI Conventions

Follow `DESIGN.md` — specifically the `## LinkTo Component Map` section. Quick reference:

| Token | Value | Tailwind class |
|---|---|---|
| Canvas (page bg) | `#f5f5f5` | `bg-[#f5f5f5]` |
| Card surface | `#ffffff` | `bg-white` |
| Card border | `1px solid #202020` | `border border-[#202020]` |
| Primary text | `#202020` | `text-[#202020]` |
| Secondary text | `#333333` | `text-[#333333]` |
| Accent / violet | `#5757f8` | `text-[#5757f8]` / `bg-[#5757f8]` |
| Border radius | `8px` | `rounded-[8px]` |
| Pills | `9999px` | `rounded-full` |

Font: use Inter via `next/font/google`. Fallback: `ui-sans-serif, system-ui`.

---

## STATE.md Protocol

1. Read STATE.md before writing any files
2. Mark your tasks `[~]` (in-progress) **before** editing any file
3. Mark `[x]` (done) when your work is complete
4. Mark `[!]` if you're blocked — explain in a `// TODO(agent-X):` code comment
5. Only update your own task rows — never modify another agent's rows

---

## Testing Conventions

| Type | Location | Runner | Command |
|---|---|---|---|
| Unit | `src/__tests__/unit/` | Vitest | `pnpm test` |
| Integration | `src/__tests__/integration/` | Vitest | `pnpm test` |
| E2E | `e2e/` | Playwright | `pnpm test:e2e` |

Integration tests use a separate test database (set `DATABASE_URL` to a test Neon branch or in-memory pg). E2E tests run against `http://localhost:3000` in CI.

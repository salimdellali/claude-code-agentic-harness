# PRD: LinkGoes — Personal URL Shortener with Analytics

## Overview

A personal URL shortener with click analytics, built as a Next.js 15 monolith on Vercel Hobby. Users create short human-readable links (e.g. `linkgoes.vercel.app/fast-cloud`), track clicks with referrer/country/device data, organize links with tags, and download QR codes. Stack: DrizzleORM + Neon PostgreSQL, Clerk auth, Tailwind + shadcn/ui, Recharts, PostHog, Vitest + Playwright. Package manager: pnpm.

> **Before starting agents:** complete the blocking steps in `SETUP.md` (pnpm, Neon, Clerk, `.env.local`).
> **Agent contract:** read `CLAUDE.md` first, then `STATE.md` to check task status before writing any code.

---

## Goals

- Create and manage short links from a clean dashboard
- Track click counts, referrers, and geographic data per link
- Organize links with tags for easy filtering
- Generate QR codes for any short link

---

## Design

All UI agents must follow `DESIGN.md` — a monochrome engineering aesthetic with a single violet accent (`#5757f8`). Key rules: `#f5f5f5` canvas, `#ffffff` cards, `1px #202020` borders (no shadows), `8px` radius on all components. The `## LinkGoes Component Map` section in `DESIGN.md` maps design tokens directly to this app's specific components (sidebar, stat cards, link table, charts, forms).

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript strict) |
| Database | Neon (serverless PostgreSQL, free tier) |
| ORM | DrizzleORM |
| Auth | Clerk (free tier, 10k MAU) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| QR codes | `qrcode` npm package |
| Monitoring | PostHog (free tier) |
| Testing | Vitest (unit + integration) + Playwright (E2E) |
| Package manager | pnpm |
| Deployment | Vercel Hobby — `prod` branch → `linkgoes.vercel.app` |
| CI/CD | GitHub Actions (lint/typecheck/tests) + Vercel auto-deploy |

---

## Data Model

### Link
```
id           String   (cuid)
slug         String   (unique) — e.g. "abc123"
originalUrl  String
title        String?  — auto-fetched from <title> tag
userId       String   — Clerk user ID
tags         Tag[]
clicks       Click[]
createdAt    DateTime
expiresAt    DateTime?
```

### Click
```
id        String
linkId    String
timestamp DateTime
referrer  String?
country   String?
city      String?
device    String?  — "mobile" | "desktop" | "tablet"
```

### Tag
```
id     String
name   String
userId String
links  Link[]
```

---

## Pages & Routes

### Public Routes
- `GET /:slug` — redirect to original URL, log a Click record

### App Routes (authenticated)
- `/` → redirect to `/dashboard`
- `/dashboard` — table of all user links with click counts, tags, actions
- `/links/new` — form to create a short link (custom slug optional, tags)
- `/links/[id]` — analytics detail: total clicks, clicks over time (line chart), top referrers (bar chart), country breakdown, QR code download
- `/tags` — manage tags (create, rename, delete)

### API Routes
- `POST /api/links` — create link, optionally auto-fetch page title
- `DELETE /api/links/[id]` — delete link
- `PATCH /api/links/[id]` — update title, tags, expiresAt
- `GET /api/links/[id]/analytics` — return aggregated click data
- `GET /api/links/[id]/qr` — return QR code PNG

---

## Features

### 1. Link Creation
- Paste any URL, optional custom slug (validates uniqueness), optional expiry date
- Default slug: auto-generated adjective-noun pair (e.g. `fast-cloud`, `bright-river`) via `src/lib/slug.ts`
- Auto-fetch page `<title>` server-side on creation
- Assign one or more tags

### 2. Dashboard
- Table: slug, original URL (truncated), title, click count, tags, created date, actions (copy, QR, delete)
- Filter by tag
- Sort by clicks or date
- Copy short link to clipboard with one click

### 3. Analytics Page (per link)
- Total clicks (last 7 days, 30 days, all time)
- Line chart: clicks per day
- Bar chart: top 5 referrers
- Table: country breakdown
- QR code with download button

### 4. Redirect Handler
- Middleware-free: a `GET /[slug]/route.ts` catches the redirect
- Logs Click with `referrer`, `country` (from `x-vercel-ip-country` header), device (UA parse)
- Returns 301 for permanent, 302 for links with expiry
- Returns 404 page if slug not found or link expired

### 5. QR Code
- Generated server-side as PNG
- Available from dashboard (hover action) and analytics page (download button)

---

## Agent Breakdown (for parallel execution)

These agents can be spawned to build the app. All agents must read `CLAUDE.md` first, then update `STATE.md` to mark tasks `[~]` before starting and `[x]` when done.

| Agent | Task | Depends On |
|---|---|---|
| **A: Scaffolding** | Init Next.js, install deps, configure Tailwind + shadcn/ui, set up Clerk | — |
| **B: Database** | Write DrizzleORM schema, generate client, run migrations, seed script | A |
| **C: Auth** | Clerk middleware, sign-in/up pages, user session plumbing | A |
| **D: Redirect handler** | `app/[slug]/route.ts`, Click logging, expiry check | B |
| **E: Link API** | `POST /api/links`, `DELETE`, `PATCH`, title auto-fetch | B, C |
| **F: Analytics API** | `GET /api/links/[id]/analytics`, aggregation queries | B |
| **G: QR API** | `GET /api/links/[id]/qr`, qrcode generation | B |
| **H: Dashboard UI** | `/dashboard` page, link table, tag filter, copy button | E, C |
| **I: Link Form UI** | `/links/new` page, form with validation | E |
| **J: Analytics UI** | `/links/[id]` page, Recharts line + bar charts | F, G |
| **K: Tags UI** | `/tags` page, tag CRUD | E |

**Parallel groups:**
- Round 1: A (scaffolding — sequential)
- Round 2: B, C (parallel — foundation)
- Round 3: D, E, F, G (parallel — APIs, all need B done)
- Round 4: H, I, J, K (parallel — UI, all need their respective APIs done)
- Round 5: L (observability), M (tests), N (CI/CD) — parallel

---

## Out of Scope (keep it simple)

- Team/sharing features
- Custom domains
- Link previews (Open Graph cards)
- Webhooks
- Password-protected links
- Bulk import/export

# SETUP.md — Manual Prerequisites

These steps must be completed by a human before agents can build or run the app. Agents cannot create accounts, provision cloud services, or access secret keys.

> See **Blocking vs Non-Blocking** at the bottom to know what must be done first vs what you can do while agents run.

---

## 0. Install pnpm — BLOCKER

Agents use pnpm exclusively. If it's not installed, every agent will fail on the first `pnpm install`.

```bash
npm install -g pnpm
```

Verify: `pnpm --version` should return a version number.

---

## 1. Database — Neon (PostgreSQL)

1. Go to [neon.tech](https://neon.tech) → create a free account
2. Create a new project named `linkto`, pick the region closest to you
3. Copy the connection string from the dashboard (looks like `postgresql://user:pass@host/dbname?sslmode=require`)
4. Save it — you'll need it in step 4

> **Why not PGlite?** PGlite is in-process/embedded — it doesn't persist across serverless function invocations on Vercel. Neon is free, serverless-native, and has a first-class Vercel integration.

---

## 2. Auth — Clerk

1. Go to [clerk.com](https://clerk.com) → create a free account
2. Create a new application named `linkto` → choose "Email" + "Google" as sign-in methods
3. From the Clerk dashboard → API Keys, copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

---

## 3. PostHog — Analytics

1. Go to [posthog.com](https://posthog.com) → create a free account
2. Create a new project named `linkto`
3. From Project Settings → Project API Key, copy:
   - `NEXT_PUBLIC_POSTHOG_KEY` (starts with `phc_`)
4. Note your host — default is `https://app.posthog.com`

---

## 4. Local — Create `.env.local`

Create this file at the root of the project before agents run Phase 2+:

```env
# Database
DATABASE_URL=postgresql://...         # from step 1

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Agents will read this file to run migrations and start the dev server. Never commit `.env.local` to git — it's already in `.gitignore`.

---

## 5. GitHub — Create Repo

1. Create a new repo at github.com named `linkto`
2. After agents finish Phase 1 scaffolding, push and create branches:
   ```bash
   git init
   git remote add origin https://github.com/YOUR_USERNAME/linkto.git
   git add .
   git commit -m "chore: initial scaffold"
   git push -u origin main
   git checkout -b staging && git push -u origin staging
   git checkout -b prod && git push -u origin prod
   ```

---

## 6. Vercel — Link & Configure

1. Go to [vercel.com](https://vercel.com) → Add New Project → import the GitHub repo from step 5
2. Set the project name to `linkto` (this claims `linkto.vercel.app`)
3. In Project Settings → Git → configure:
   - `prod` branch → Production deployment (maps to `linkto.vercel.app`)
   - `staging` branch → Preview deployment
4. In Project Settings → Environment Variables, add all vars from step 4 (use `linkto.vercel.app` for `NEXT_PUBLIC_APP_URL` in Production)

---

## Blocking vs Non-Blocking

### Must complete BEFORE starting agents

| Step | Why it blocks |
|---|---|
| **Step 0: Install pnpm** | Agents run `pnpm install` immediately — missing pnpm breaks everything |
| **Step 4: Create `.env.local`** | Agents in Phase 2+ need `DATABASE_URL` and Clerk keys to run migrations and auth |
| **Step 1: Neon `DATABASE_URL`** | Agent B (Phase 2) runs `pnpm drizzle-kit push` — needs a live DB connection |
| **Step 2: Clerk keys** | Agent C (Phase 2) wires Clerk middleware — app won't build without valid keys |

### Can be done while agents run Phase 1–2

| Step | When you need it |
|---|---|
| **Step 3: PostHog** | Needed before Phase 5 (observability) — Phase 1–4 runs without it |
| **Step 5: GitHub repo** | Needed before agents push code; Phase 1 scaffolding runs locally first |
| **Step 6: Vercel setup** | Needed only for deployment — local dev works without it |

---

## Summary Checklist

**Before starting agents:**
- [ ] pnpm installed (`pnpm --version` works)
- [ ] Neon account created, `DATABASE_URL` copied
- [ ] Clerk account created, both keys copied
- [ ] `.env.local` created at project root with all vars

**While agents run Phase 1–2:**
- [ ] PostHog account created, key copied, added to `.env.local`
- [ ] GitHub repo created (`linkto`), `staging` and `prod` branches pushed
- [ ] Vercel project linked, `prod` branch mapped to `linkto.vercel.app`
- [ ] Env vars added in Vercel dashboard

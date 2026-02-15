# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Next.js)
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier (write)
npm run format:check # Prettier (check only)
npm test             # Run all tests once (vitest run)
npm run test:watch   # Run tests in watch mode
npx tsc --noEmit     # Type check
npx vitest run __tests__/components/okr/score-ring.test.tsx  # Run a single test file
```

CI runs lint, type check, and tests on every push/PR to `master`.

## Architecture

### What this app is

An OKR (Objectives & Key Results) management platform. Organisations create quarterly cycles, set team/cross-cutting/individual objectives, assign measurable key results, and track progress via check-ins. Scores auto-calculate up the chain: check-in → KR score → objective score.

### Tech stack

Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS 4 + shadcn/ui + Supabase (PostgreSQL + Auth) + Vercel hosting.

### Route structure

- `app/page.tsx` — redirects to `/dashboard`
- `app/(auth)/` — public auth pages (login, signup, forgot-password, reset-password)
- `app/(app)/` — authenticated app shell with sidebar layout (`AppSidebar` + `SidebarInset`)
  - `dashboard/` — My OKRs (personal view)
  - `teams/` — Team view
  - `people/` — Manager/people view
  - `cycles/` — Cycle management
  - `settings/` — Admin settings
- `app/auth/` — API route handlers for auth callbacks (confirm, signout)

The `(auth)` group has no layout wrapper. The `(app)` group wraps children in `SidebarProvider` + `AppSidebar`.

### Auth flow

Supabase email/password auth. `middleware.ts` runs on every request, refreshing sessions and redirecting unauthenticated users to `/login` (except auth routes). Two Supabase clients exist:
- `lib/supabase/server.ts` — server components and server actions (uses cookies)
- `lib/supabase/client.ts` — client components (browser client)

### Data model

`Organisation → Team → OKR Cycle → Objective → Key Result → Check-in`

- **Objective types**: `team` (requires team_id), `cross_cutting` (org-wide), `individual` (requires owner_id)
- **Objective status**: draft → active → completed/cancelled
- **KR status (RAG)**: on_track, at_risk, off_track
- **Scoring**: KR score = current_value / target_value (capped at 1.0); objective score = average of its KR scores

Types in `types/database.ts` mirror the PostgreSQL schema. Schema lives in `supabase/migrations/00001_initial_schema.sql` with full RLS policies.

### Server actions

All backend logic is in `lib/actions/` as Next.js server actions (not API routes):
- `organisations.ts` — org CRUD
- `teams.ts` — team CRUD, member management
- `cycles.ts` — cycle CRUD, set active, carry forward
- `objectives.ts` — objective CRUD with filtering (by cycle, type, team, owner, status)
- `key-results.ts` — KR CRUD with auto-scoring
- `check-ins.ts` — check-in creation with cascading score recalculation

Every mutation calls `revalidatePath('/')` after success.

### Component conventions

- **OKR domain components** in `components/okr/` — ObjectiveCard, KeyResultRow, ScoreRing, ProgressBar, StatusBadge, etc. Barrel export via `components/okr/index.ts`.
- **Layout components** in `components/layout/` — AppSidebar, AppHeader, UserDropdown.
- **shadcn/ui primitives** in `components/ui/` — installed via `npx shadcn add <component>`.

### Design system

- Primary color: indigo (oklch)
- RAG status colors defined as CSS custom properties: `--status-on-track`, `--status-at-risk`, `--status-off-track` (with foreground and muted variants)
- Tailwind classes: `bg-status-on-track`, `bg-status-at-risk`, `bg-status-off-track`
- Dark mode via `.dark` class with `@custom-variant dark (&:is(.dark *))`
- Fonts: Geist Sans + Geist Mono

### Testing

Vitest + React Testing Library + jsdom. Tests live in `__tests__/` mirroring the source tree. Setup file `vitest.setup.ts` imports `@testing-library/jest-dom/vitest` for DOM matchers. Path alias `@/` is configured in `vitest.config.ts`.

### Environment variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Supabase

- **Project ID**: `wvyaeavwooiyczwyvtye`
- **Region**: eu-west-1
- Migrations in `supabase/migrations/`, seed data in `supabase/seed.sql`
- All tables have RLS enabled. Permissions are role-based: admin > team_lead > member

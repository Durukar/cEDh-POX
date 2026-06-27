## Context

This is a greenfield project for a cEDH (competitive Commander) Magic: The Gathering tournament portal. The organizer currently tracks match results manually. The portal will be a monorepo deploying a REST API to Cloudflare Workers and a React SPA to Cloudflare Pages, with data persisted in Cloudflare D1 (SQLite at the edge).

There are no existing systems to migrate — this is a net-new deployment.

## Goals / Non-Goals

**Goals:**
- Public leaderboard showing player rankings, points, match stats, and commanders
- Admin UI for entering tournament data (matches, players, results, commanders, disband status)
- Monorepo structure with isolated `apps/backend` and `apps/frontend` workspaces under Bun
- Deploy API to Cloudflare Workers, SPA to Cloudflare Pages
- Scoring: Win = 3 pts, Draw = 1 pt, Loss = 0 pts
- Track per-match: match number, registered players, players who played, disbanded players, commander names

**Non-Goals:**
- Real-time live updates (websockets / SSE) — polling via TanStack Query is sufficient for v1
- User authentication for public viewers — leaderboard is public
- Multi-tournament support in v1 — single active championship
- Mobile-native app
- Payment or prize tracking

## Decisions

### D1: Monorepo Layout — Bun Workspaces

```
cEDh-POX/
  package.json          # root workspace
  apps/
    backend/            # Bun + Hono + Cloudflare Workers
    frontend/           # React 19 + Vite + TanStack
  packages/
    shared/             # shared TypeScript types (DTO shapes)
```

**Why**: Keeps API contracts in a shared package, avoiding type drift between frontend and backend. Bun's native workspace support makes cross-package imports zero-config.

**Alternatives considered**: Separate repos — rejected because it introduces friction when evolving API shapes; Turborepo — unnecessary overhead for a two-app monorepo.

### D2: Backend Framework — Hono on Cloudflare Workers

Hono is the de-facto standard for Cloudflare Workers due to its tiny footprint, first-class Worker support, and TypeScript ergonomics. It provides routing, middleware, and RPC-style typed client generation.

**Alternatives considered**: Itty Router — less ergonomic, no middleware; Express — not Worker-compatible natively.

### D3: Database — Cloudflare D1 (SQLite)

D1 runs SQLite at the edge, co-located with the Worker. No external database provisioning required, free tier covers this use case, and migrations are managed via Wrangler CLI.

**Schema (simplified)**:
```sql
players (id, name, created_at)
matches (id, match_number, played_at, notes)
match_entries (id, match_id, player_id, commander_name, status [active|disband], result [win|draw|loss|none], points)
```

**Alternatives considered**: PlanetScale / Turso — adds external dependency and latency; KV — not relational, poor fit for standings queries.

### D4: Frontend Stack — React 19 + Vite + TanStack Suite

- **TanStack Router**: type-safe file-based routing, replaces React Router
- **TanStack Query**: server-state caching and polling for leaderboard data
- **TanStack Table**: headless table for leaderboard rendering with sorting/filtering
- **Styling**: Tailwind CSS v4 — utility-first, minimal bundle, pairs well with a minimalist design

**Alternatives considered**: Next.js — overkill for a static SPA deployed to Pages; SvelteKit — less ecosystem alignment with TanStack suite.

### D5: Admin Area Protection — Simple Secret Token (v1)

The admin area will be protected by a static secret token passed as a header or stored in `localStorage` after entry. This is sufficient for a single-organizer v1 use case.

**Why not full auth**: Avoids Clerk/Auth.js setup overhead for a single-user admin panel. Can be upgraded later.

### D6: API Design — REST via Hono

Public endpoints (no auth):
- `GET /api/leaderboard` — ranked player standings
- `GET /api/matches` — match list with entries

Admin endpoints (token required):
- `POST /api/admin/matches` — create match
- `POST /api/admin/matches/:id/entries` — add player entry to match
- `PUT /api/admin/matches/:id/entries/:entryId` — update result/commander/status
- `DELETE /api/admin/matches/:id` — remove match

## Risks / Trade-offs

- **D1 is eventually consistent on free tier** → Mitigation: acceptable for tournament standings which update infrequently; not a real-time system
- **Static admin token is insecure if leaked** → Mitigation: token stored as a Cloudflare Worker secret (env var), never exposed in frontend bundle; can rotate it manually
- **No optimistic updates in admin UI** → Mitigation: TanStack Query invalidation provides fast-enough feedback for a single-organizer workflow
- **Cloudflare D1 migration workflow is manual** → Mitigation: Wrangler `d1 migrations` CLI keeps schema versioned in the repo

## Migration Plan

1. Initialize monorepo with `bun init` and workspace config
2. Scaffold `apps/backend` with Hono + Wrangler, provision D1 database, run initial migration
3. Scaffold `apps/frontend` with Vite + React + TanStack
4. Deploy backend to Workers via `wrangler deploy`
5. Deploy frontend to Pages via Cloudflare Pages Git integration or `wrangler pages deploy`
6. No rollback complexity — greenfield with no users yet

## Open Questions

- Should disbanded players appear in the leaderboard at all, or only active participants?
- Is there a need to track which tournament/season a match belongs to (for future multi-season support)?
- Should the admin token be scoped per-tournament or global?

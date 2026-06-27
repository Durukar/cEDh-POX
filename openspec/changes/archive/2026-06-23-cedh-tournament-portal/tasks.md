## 1. Monorepo & Infra Setup

- [x] 1.1 Initialize root `package.json` with Bun workspaces (`apps/*`, `packages/*`) and convenience scripts (`dev:backend`, `dev:frontend`, `build`, `deploy`)
- [x] 1.2 Create `packages/shared` workspace with TypeScript config and export barrel for shared DTO types (`LeaderboardEntry`, `Match`, `MatchEntry`, `Player`)
- [x] 1.3 Scaffold `apps/backend` with `package.json`, `tsconfig.json`, and Wrangler config (`wrangler.toml`) — Worker name, D1 binding, compatibility date
- [x] 1.4 Scaffold `apps/frontend` with Vite + React plugin (`bun create vite`) — TypeScript template, configure `vite.config.ts`
- [x] 1.5 Install and configure Tailwind CSS v4 in `apps/frontend`
- [x] 1.6 Install TanStack Router, TanStack Query, and TanStack Table in `apps/frontend`
- [x] 1.7 Run `bun install` at repo root and verify all workspace dependencies resolve

## 2. Database Schema & Migrations

- [x] 2.1 Create `apps/backend/migrations/0001_initial.sql` — define `players`, `matches`, and `match_entries` tables with correct columns and foreign keys
- [ ] 2.2 Apply migration locally with `wrangler d1 migrations apply --local` and verify tables exist
- [ ] 2.3 Provision Cloudflare D1 database via Wrangler (`wrangler d1 create cedh-pox-db`) and update `wrangler.toml` with the database ID

## 3. Backend — Public API

- [x] 3.1 Install Hono in `apps/backend` and set up the Hono app entry point with D1 env binding
- [x] 3.2 Implement `GET /api/leaderboard` — query `match_entries` joined with `players`, aggregate points (win=3, draw=1, loss=0) excluding `disband` entries, return sorted standings
- [x] 3.3 Implement `GET /api/matches` — return all matches with their entries, player names, commanders, statuses, and results
- [x] 3.4 Add CORS middleware to allow requests from the Pages frontend domain

## 4. Backend — Admin API

- [x] 4.1 Create admin auth middleware that validates `X-Admin-Token` header against `ADMIN_TOKEN` Worker secret; returns 401 on failure
- [x] 4.2 Implement `POST /api/admin/matches` — create match with match number and optional notes
- [x] 4.3 Implement `POST /api/admin/matches/:id/entries` — add a player entry (player name, commander, status, result); auto-calculate points
- [x] 4.4 Implement `PUT /api/admin/matches/:id/entries/:entryId` — update entry fields (result, commander, status); recalculate points
- [x] 4.5 Implement `DELETE /api/admin/matches/:id` — delete match and cascade-delete all entries
- [ ] 4.6 Set `ADMIN_TOKEN` as a Wrangler secret (`wrangler secret put ADMIN_TOKEN`) for local and production environments

## 5. Frontend — Routing & Layout

- [x] 5.1 Configure TanStack Router with file-based routing — create `routes/__root.tsx` with shared layout (nav bar, footer)
- [x] 5.2 Create public route `routes/index.tsx` (leaderboard page)
- [x] 5.3 Create admin route `routes/admin/index.tsx` (admin dashboard) and `routes/admin/matches/$matchId.tsx` (match detail/edit)
- [x] 5.4 Configure TanStack Query `QueryClient` and wrap app in `QueryClientProvider`
- [x] 5.5 Create API client module (`src/lib/api.ts`) that reads `VITE_API_BASE_URL` env var and attaches `X-Admin-Token` from `localStorage` on admin requests

## 6. Frontend — Leaderboard Page

- [x] 6.1 Create `useLeaderboard` query hook using TanStack Query — fetches `GET /api/leaderboard`, refetch interval 60 seconds
- [x] 6.2 Build leaderboard table using TanStack Table — columns: rank, player name, commander(s), points, wins, draws, losses, matches played
- [x] 6.3 Style the leaderboard with Tailwind — minimalist dark theme, clean typography, responsive layout
- [x] 6.4 Add loading skeleton and empty-state for leaderboard

## 7. Frontend — Admin Area

- [x] 7.1 Implement token gate: on `/admin` mount, check `localStorage` for token; if absent, show token entry modal; store on submit
- [x] 7.2 Build admin dashboard — match list with match number, entry count, and action buttons (view entries, delete)
- [x] 7.3 Build "Create Match" form — fields: match number, notes; POST to `/api/admin/matches`
- [x] 7.4 Build "Add Player Entry" form — fields: player name, commander name, status (active/disband), result (win/draw/loss); POST to `/api/admin/matches/:id/entries`
- [x] 7.5 Build "Edit Entry" form — pre-filled with current values; PUT to `/api/admin/matches/:id/entries/:entryId`
- [x] 7.6 Implement delete match with confirmation dialog; DELETE to `/api/admin/matches/:id`
- [x] 7.7 Show 401 error toast when admin token is rejected; clear stored token and re-prompt

## 8. Deployment

- [ ] 8.1 Deploy backend Worker to Cloudflare via `wrangler deploy` from `apps/backend`
- [ ] 8.2 Apply D1 migration to production database: `wrangler d1 migrations apply cedh-pox-db`
- [ ] 8.3 Create `.env.production` in `apps/frontend` with `VITE_API_BASE_URL` pointing to deployed Worker URL
- [ ] 8.4 Deploy frontend to Cloudflare Pages via `wrangler pages deploy dist` from `apps/frontend` (or configure Pages Git integration)
- [ ] 8.5 Set `ADMIN_TOKEN` production secret via `wrangler secret put ADMIN_TOKEN`
- [ ] 8.6 Verify end-to-end: add a match via admin, confirm leaderboard reflects updated standings

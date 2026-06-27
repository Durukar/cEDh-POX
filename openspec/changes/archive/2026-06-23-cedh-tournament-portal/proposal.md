## Why

The cEDH (competitive Commander) Magic: The Gathering community lacks a dedicated portal for tracking tournament standings and match results. A purpose-built leaderboard portal will allow organizers to record match data and players to follow rankings in real time, replacing ad-hoc spreadsheets with a modern, accessible web interface.

## What Changes

- New monorepo project (`cEDh-POX`) with separate `apps/backend` (Bun + Cloudflare Workers) and `apps/frontend` (React + Vite + TanStack) workspaces
- Public leaderboard page displaying ranked players with points, match history, and commander information
- Admin area (protected) for organizers to enter match data: player registrations, results, commander names, and disband status
- Scoring system: Win = 3 pts, Draw = 1 pt, Loss = 0 pts
- Per-match tracking: match number, registered players, active players, disbanded players (those who did not participate), commander names
- Deployment pipeline targeting Cloudflare Workers (API) and Cloudflare Pages (SPA)

## Capabilities

### New Capabilities

- `leaderboard`: Public-facing ranked standings — displays players sorted by total points, with match count, wins, draws, losses, and commander info
- `match-management`: Admin capability to create matches, register players per match, record outcomes (win/draw/loss/disband), and assign commander names
- `admin-area`: Protected admin UI and backend routes for managing tournament data (matches, players, results)
- `monorepo-infra`: Bun workspaces monorepo setup with shared tooling, Cloudflare Workers backend, and Cloudflare Pages frontend deployment configuration

### Modified Capabilities

## Impact

- New project from scratch — no existing code affected
- Dependencies: Bun runtime, Hono (Cloudflare Workers web framework), React 19, Vite (latest), TanStack Router, TanStack Query, TanStack Table, Cloudflare D1 (SQLite for Workers) for persistence, Wrangler CLI for deployment
- Cloudflare account required for Workers + Pages + D1

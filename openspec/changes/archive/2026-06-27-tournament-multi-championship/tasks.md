## 1. Database — Migration

- [x] 1.1 Create `apps/backend/migrations/0002_tournaments.sql`: CREATE TABLE `tournaments` (id, name, description, status `active|finished`, created_at)
- [x] 1.2 In same migration: ALTER TABLE `matches` ADD COLUMN `tournament_id INTEGER REFERENCES tournaments(id) DEFAULT 1`
- [x] 1.3 In same migration: INSERT default tournament (id=1, name='POX — Temporada 1', status='finished') and UPDATE all existing matches SET tournament_id=1
- [x] 1.4 Update `apps/backend/migrations/seed_local.sql` to include the default tournament insert
- [x] 1.5 Apply migration to local D1 (`wrangler d1 execute ... --local --file=migrations/0002_tournaments.sql`)

## 2. Shared Types

- [x] 2.1 Add `Tournament { id, name, description, status, created_at, match_count? }` to `packages/shared/src/types.ts`
- [x] 2.2 Add `TournamentStandings` (extends `LeaderboardEntry` with `tournament_id`) and `PlayerProfile { player, career_stats, tournaments[] }` types

## 3. Backend — Tournament Routes

- [x] 3.1 Create `apps/backend/src/routes/tournaments.ts` with `GET /` returning all tournaments ordered by status (active first) then created_at desc, including match_count
- [x] 3.2 Add `GET /:id` returning single tournament (404 if missing)
- [x] 3.3 Add `GET /:id/matches` returning all matches for a tournament with entries (replaces `/api/matches`)
- [x] 3.4 Add `GET /:id/standings` returning ranked player standings for a tournament (port leaderboard query, scoped by tournament_id)
- [x] 3.5 Register public tournament routes on `/api/tournaments` in `apps/backend/src/index.ts`

## 4. Backend — Admin Tournament Routes

- [x] 4.1 Create `apps/backend/src/routes/admin-tournaments.ts` with `GET /` (list), `POST /` (create — validate name, 409 on duplicate), `PUT /:id` (rename/status), `DELETE /:id` (409 if has matches)
- [x] 4.2 Register admin tournament routes on `/api/admin/tournaments` in `apps/backend/src/index.ts` (before `/api/admin`)

## 5. Backend — Refactor Match Routes

- [x] 5.1 Update `POST /api/admin/matches` to require `tournament_id`; validate tournament exists and is `active` (409 if finished)
- [x] 5.2 Remove or deprecate `GET /api/matches` global endpoint (replace with tournament-scoped `/api/tournaments/:id/matches`)
- [x] 5.3 Update leaderboard route: remove `/api/leaderboard`; standings now served by `/api/tournaments/:id/standings`

## 6. Backend — Player Profile Route

- [x] 6.1 Add `GET /api/players/:id` public route returning player info + career stats + per-tournament history (points, position, wins, draws, losses, matches_played, commanders)
- [x] 6.2 Register player profile route in `apps/backend/src/index.ts`

## 7. Frontend — API Layer

- [x] 7.1 Add `fetchTournaments`, `fetchTournament`, `fetchTournamentMatches`, `fetchTournamentStandings` to `apps/frontend/src/lib/api.ts`
- [x] 7.2 Add `fetchPlayerProfile` to `apps/frontend/src/lib/api.ts`
- [x] 7.3 Add admin API functions: `createTournament`, `updateTournament`, `deleteTournament`
- [x] 7.4 Update `createMatch` to include `tournament_id` param
- [x] 7.5 Remove or update `fetchLeaderboard` and `fetchMatches` (now tournament-scoped)

## 8. Frontend — Public Pages

- [x] 8.1 Create `apps/frontend/src/routes/tournaments.index.tsx` — tournament list page (`/campeonatos`), shows name, status badge, match count, link to detail
- [x] 8.2 Create `apps/frontend/src/routes/tournaments.$tournamentId.tsx` — tournament detail page (`/campeonatos/$tournamentId`): standings table + rounds list
- [x] 8.3 Create `apps/frontend/src/routes/players.$playerId.tsx` — player profile page (`/jogadores/$playerId`): career stats + tournament history table with commanders
- [x] 8.4 Update `routeTree.gen.ts` to include the three new public routes as siblings of rootRoute
- [x] 8.5 Update root index route (`/`) to redirect to `/campeonatos` or display the tournament list directly

## 9. Frontend — Admin Pages

- [x] 9.1 Create `apps/frontend/src/routes/admin/tournaments.tsx` — admin tournament list/management page (`/admin/tournaments`): create form + table with edit/delete
- [x] 9.2 Create `apps/frontend/src/routes/admin/tournaments.$tournamentId.tsx` — admin tournament detail (`/admin/tournaments/$tournamentId`): match list + create match form scoped to tournament
- [x] 9.3 Migrate `AdminDashboard` to show tournaments instead of a global match list; update nav link from `/admin/players` to tournament context
- [x] 9.4 Update `CreateMatchForm` to receive and pass `tournament_id`
- [x] 9.5 Update `routeTree.gen.ts` to include the two new admin routes

## 10. Verification

- [ ] 10.1 Manually test tournament CRUD: create → rename → finish → reopen → delete (empty and with matches)
- [ ] 10.2 Manually test match creation within a tournament and that finished tournament rejects new matches
- [ ] 10.3 Verify tournament standings update correctly after adding/removing match entries
- [ ] 10.4 Verify player profile shows correct career stats and per-tournament breakdown
- [ ] 10.5 Verify existing matches were migrated to the default tournament and are accessible

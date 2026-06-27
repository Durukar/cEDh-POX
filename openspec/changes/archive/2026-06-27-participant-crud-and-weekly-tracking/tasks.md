## 1. Backend — Players API

- [x] 1.1 Create `apps/backend/src/routes/players.ts` with `GET /api/admin/players` returning all players ordered by name
- [x] 1.2 Add `POST /api/admin/players` to create a player — validate non-empty name, return 409 on duplicate
- [x] 1.3 Add `PUT /api/admin/players/:id` to rename a player — validate non-empty name, 404 on missing, 409 on duplicate
- [x] 1.4 Add `DELETE /api/admin/players/:id` — return 404 on missing, 409 with entry count if player has match_entries
- [x] 1.5 Register the players router on `/api/admin/players` in `apps/backend/src/index.ts` under admin auth middleware

## 2. Backend — Match Entry Breaking Change

- [x] 2.1 Update `POST /api/admin/matches/:id/entries` to accept `player_id` (integer) instead of `player_name` (string)
- [x] 2.2 Add validation: lookup player by `player_id`; return 404 if not found
- [x] 2.3 Remove implicit player upsert logic from the entry creation handler
- [x] 2.4 Update seed data / local migration if needed so `player_id` references are consistent

## 3. Frontend — Players Admin UI

- [x] 3.1 Create `apps/frontend/src/routes/admin/players.tsx` route with the player list table
- [x] 3.2 Build `PlayerList` component: table with columns Name, Created At, Actions (Edit, Delete)
- [x] 3.3 Build inline `AddPlayerForm` component (name input + submit) rendered above the table
- [x] 3.4 Build inline `EditPlayerDialog` component (name input pre-filled + confirm/cancel)
- [x] 3.5 Add delete confirmation with error display when backend returns 409 (has entries)
- [x] 3.6 Wire API calls: fetch players on mount, POST on add, PUT on rename, DELETE on remove
- [x] 3.7 Add "Participantes" navigation link in the admin area sidebar/tabs pointing to `/admin/players`

## 4. Frontend — Match Entry Flow Update

- [x] 4.1 Update `AddEntryForm` (in match detail page) to replace the `player_name` text input with a player dropdown
- [x] 4.2 Fetch registered players list when the entry form opens (reuse players API)
- [x] 4.3 Change form submission to send `player_id` instead of `player_name`
- [x] 4.4 Display player name in the entry list using data from the dropdown (not raw ID)

## 5. Frontend — Weekly Roster View

- [x] 5.1 Ensure match detail page (`/admin/matches/:matchId`) shows all current entries with player name, commander, status, result, points
- [x] 5.2 Add "Remove" action per entry row that calls `DELETE /api/admin/matches/:id/entries/:entryId` (implement endpoint if missing)
- [x] 5.3 Show empty state when a match has no entries yet, with prompt to add first participant

## 6. Verification

- [ ] 6.1 Manually test full player CRUD flow: create → rename → verify duplicate rejected → delete (with and without entries)
- [ ] 6.2 Manually test match entry flow: add player via dropdown → verify entry appears in roster → remove entry
- [ ] 6.3 Verify leaderboard recalculates correctly after entry removal
- [x] 6.4 Confirm old `player_name` free-text path is no longer accepted by the API

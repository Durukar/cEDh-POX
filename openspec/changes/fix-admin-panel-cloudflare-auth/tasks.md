## 1. Backend: Fix CORS configuration

- [x] 1.1 Add `FRONTEND_ORIGIN` to the `Env` type in `apps/backend/src/index.ts`
- [x] 1.2 Replace the bare `cors()` call with `cors({ origin: (origin, c) => c.env.FRONTEND_ORIGIN ?? 'http://localhost:5173', credentials: true })` so credentialed requests from the frontend are accepted
- [x] 1.3 Add `FRONTEND_ORIGIN` to `[vars]` in `wrangler.toml` (e.g. `FRONTEND_ORIGIN = "https://cedh-pox.pages.dev"`) and document it in the inline comments

## 2. Frontend: Forward credentials on all admin API calls

- [x] 2.1 In `apps/frontend/src/lib/api.ts`, extract a small `adminFetch(input, init?)` helper that calls `fetch(input, { credentials: 'include', ...init })` so credentials don't have to be repeated on every call
- [x] 2.2 Replace every `fetch()` call that targets an `/api/admin/*` endpoint with the new `adminFetch` helper (covers: `fetchAdminTournaments`, `createTournament`, `updateTournament`, `deleteTournament`, `fetchMatch`, `createMatch`, `deleteMatch`, `createEntry`, `updateEntry`, `deleteEntry`, `fetchPlayers`, `createPlayer`, `updatePlayer`, `deletePlayer`)
- [x] 2.3 Remove any remaining references to `localStorage` token storage or `X-Admin-Token` header if they exist in the frontend code

## 3. Cleanup: Remove old token-based auth artifacts

- [x] 3.1 Search for any remaining `ADMIN_TOKEN` references in backend source and remove them
- [x] 3.2 Search for any token prompt UI components (e.g. a modal or input asking for admin password) and remove them from the frontend

## 4. Verification

- [x] 4.1 Run `wrangler dev` locally and confirm admin routes pass through without auth (since `CF_ACCESS_AUD` is unset in dev)
- [x] 4.2 Confirm TypeScript compiles without errors (`tsc --noEmit` in both `apps/backend` and `apps/frontend`)

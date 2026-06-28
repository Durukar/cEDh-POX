## Why

After migrating authentication to Cloudflare Access JWT validation, all admin panel operations (creating matches, players, entries, etc.) return 401 Unauthorized. The backend `adminAuth` middleware requires the `Cf-Access-Jwt-Assertion` header, which Cloudflare's edge injects only when the browser sends the `CF_Authorization` cookie with the request. Currently, all admin `fetch()` calls in the frontend omit `credentials: 'include'`, so the cookie is never forwarded on cross-origin requests, and the header is never injected by CF Access.

Compounding the problem, the backend `cors()` call uses its default wildcard origin (`*`), which browsers reject for credentialed requests — making it impossible to fix the client side without also fixing the server.

## What Changes

- All admin API `fetch()` calls in `apps/frontend/src/lib/api.ts` will include `credentials: 'include'` so the `CF_Authorization` cookie is sent with every request.
- The backend CORS configuration will be updated to allow the specific frontend origin with `credentials: true`, replacing the wildcard default.

## Capabilities

### New Capabilities
- none

### Modified Capabilities
- `admin-auth`: CORS + credential-forwarding requirements for admin API calls through Cloudflare Access

## Impact

- `apps/frontend/src/lib/api.ts` — all admin fetch calls
- `apps/backend/src/index.ts` — CORS middleware configuration
- Requires `VITE_FRONTEND_ORIGIN` (or equivalent) to be set in the Worker environment for production CORS origin

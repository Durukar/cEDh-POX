## Context

The project uses Cloudflare Access to protect admin API routes. The backend middleware (`adminAuth`) validates a JWT passed in the `Cf-Access-Jwt-Assertion` header, which Cloudflare's edge automatically injects when:

1. The target route is protected by a CF Access policy
2. The browser sends a valid `CF_Authorization` cookie alongside the request

The frontend (`apps/frontend/src/lib/api.ts`) makes cross-origin `fetch()` calls to the backend Worker. Since no `credentials: 'include'` option is set, the browser strips cookies from these requests (same-site lax/strict or cross-origin). Without the cookie, CF Access cannot validate the user session and therefore does not inject the JWT header — so the backend always returns 401.

Additionally, the backend's `cors()` call uses default settings (`Access-Control-Allow-Origin: *`). The `*` wildcard is explicitly forbidden by browsers when credentials are involved (`credentials: 'include'`), so even after adding credentials to fetch calls, the browser would block the response unless CORS is fixed.

## Goals / Non-Goals

**Goals:**
- Admin API calls from the browser forward the `CF_Authorization` cookie so CF Access injects the JWT assertion header
- Backend CORS allows credentialed requests from the known frontend origin
- Local dev is unaffected (auth is already bypassed when `CF_ACCESS_AUD` is unset)

**Non-Goals:**
- Changing the authentication mechanism itself (JWT validation stays as-is)
- Adding a login UI — CF Access handles that flow
- Supporting multiple frontend origins (one origin per environment is sufficient)

## Decisions

### 1. Add `credentials: 'include'` to all admin fetch calls

Every function in `lib/api.ts` that hits `/api/admin/*` must include `{ credentials: 'include' }` in the fetch options. Public routes (`/api/tournaments`, `/api/players`) are unaffected — they don't require auth.

A shared `adminFetch` helper will be extracted to avoid repeating options in every call.

### 2. CORS: replace wildcard with explicit origin + credentials

`cors()` in `apps/backend/src/index.ts` must be updated to:

```ts
cors({
  origin: c.env.FRONTEND_ORIGIN,   // e.g. "https://cedh-pox.pages.dev"
  credentials: true,
})
```

`FRONTEND_ORIGIN` is a Worker var (non-secret, set in `wrangler.toml` or via `wrangler secret put`). For local dev it falls back to `http://localhost:5173`.

Because Hono's `cors()` accepts a function for `origin`, this can handle a single env var cleanly without needing a list.

### 3. No changes to backend auth logic

The `adminAuth` middleware is correct. The fix is entirely in how the frontend sends requests and how CORS is configured.

## Risks / Trade-offs

- **`FRONTEND_ORIGIN` must be configured correctly in production** — wrong value breaks all admin fetch calls (CORS rejection). This should be documented and set before deploying.
- **Credentialed requests + CF Access require the API to also be behind the CF Access policy** — if the Worker route is not protected by CF Access, the `Cf-Access-Jwt-Assertion` header won't be injected regardless. This is an infra config concern outside the code change, but worth noting.

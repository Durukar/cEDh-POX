## MODIFIED Requirements

### Requirement: Admin area requires Cloudflare Access authentication to operate
The system SHALL use Cloudflare Access JWT validation to protect the admin area. The frontend SHALL NOT prompt for or store any token — authentication is handled entirely by Cloudflare Access at the edge. All admin API requests SHALL be made with `credentials: 'include'` so the browser forwards the `CF_Authorization` cookie, enabling Cloudflare Access to inject the `Cf-Access-Jwt-Assertion` header.

#### Scenario: Unauthenticated user is redirected by Cloudflare Access
- **WHEN** a user without a valid CF Access session accesses an admin route
- **THEN** Cloudflare Access redirects the user to the authentication page (handled by CF infrastructure, not the app)

#### Scenario: Authenticated user can perform admin operations
- **WHEN** a user with a valid `CF_Authorization` cookie submits an admin form
- **THEN** the browser forwards the cookie, CF Access injects the JWT header, and the API accepts the request

#### Scenario: No localStorage token prompt
- **WHEN** admin navigates to `/admin`
- **THEN** no token entry prompt is shown; the dashboard renders immediately for authenticated users

### Requirement: Backend validates Cloudflare Access JWT on all protected admin routes
The system SHALL reject any request to `/api/admin/*` that does not include a valid `Cf-Access-Jwt-Assertion` header. The Worker SHALL verify the JWT signature against Cloudflare Access public keys using the configured `CF_ACCESS_AUD` and `CF_ACCESS_TEAM_DOMAIN` secrets. In local development (when `CF_ACCESS_AUD` is not set), authentication SHALL be bypassed.

#### Scenario: Missing JWT returns 401
- **WHEN** a request to `/api/admin/*` is made without the `Cf-Access-Jwt-Assertion` header in production
- **THEN** the Worker returns HTTP 401 with an error message

#### Scenario: Invalid or expired JWT returns 401
- **WHEN** a request includes a JWT that fails signature verification or is expired
- **THEN** the Worker returns HTTP 401

#### Scenario: Valid JWT allows admin operations
- **WHEN** a request includes a valid `Cf-Access-Jwt-Assertion` JWT
- **THEN** the Worker processes the request and returns the appropriate response

#### Scenario: Local dev bypasses auth
- **WHEN** `CF_ACCESS_AUD` environment variable is not set
- **THEN** the `adminAuth` middleware skips JWT validation and passes the request through

### Requirement: Backend CORS allows credentialed requests from the frontend origin
The system SHALL configure CORS to allow the known frontend origin with `credentials: true`. The `Access-Control-Allow-Origin` header SHALL NOT be the wildcard `*` for admin routes, as browsers reject credentialed responses with wildcard origins. The allowed origin SHALL be configured via the `FRONTEND_ORIGIN` Worker variable.

#### Scenario: Credentialed admin request succeeds with correct CORS
- **WHEN** the frontend makes a credentialed fetch to `/api/admin/*` from the configured `FRONTEND_ORIGIN`
- **THEN** the browser receives `Access-Control-Allow-Credentials: true` and the response is accepted

#### Scenario: Request from unknown origin is rejected
- **WHEN** a fetch is made from an origin not matching `FRONTEND_ORIGIN`
- **THEN** the browser does not receive the `Access-Control-Allow-Credentials` header and the response is blocked

## REMOVED Requirements

### Requirement: Admin area requires a secret token to operate
**Reason**: Replaced by Cloudflare Access JWT validation. Token-based auth via `X-Admin-Token` / `localStorage` is removed.
**Migration**: Authentication is now handled by Cloudflare Access. Users must have a valid CF Access session. No client-side token management is required.

### Requirement: Backend validates admin token on all protected routes
**Reason**: Replaced by Cloudflare Access JWT validation via `Cf-Access-Jwt-Assertion` header.
**Migration**: Remove `ADMIN_TOKEN` Worker secret. Configure `CF_ACCESS_AUD` and `CF_ACCESS_TEAM_DOMAIN` instead.

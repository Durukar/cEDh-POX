## ADDED Requirements

### Requirement: Project is structured as a Bun workspaces monorepo
The system SHALL be organized as a monorepo with Bun workspaces defined in the root `package.json`. Workspaces SHALL include `apps/backend`, `apps/frontend`, and `packages/shared`.

#### Scenario: Workspace resolution works across packages
- **WHEN** `apps/frontend` imports from `@cedh-pox/shared`
- **THEN** Bun resolves the import to `packages/shared` without manual path aliases

#### Scenario: Root install installs all workspace dependencies
- **WHEN** `bun install` is run at the repo root
- **THEN** all workspace packages have their dependencies installed

### Requirement: Backend workspace targets Cloudflare Workers with Wrangler
The `apps/backend` workspace SHALL use Hono as the web framework and Wrangler as the build/deploy tool. The `wrangler.toml` SHALL define the Worker name, D1 database binding, and compatibility date.

#### Scenario: Backend starts locally with Wrangler dev
- **WHEN** `bun run dev` is run in `apps/backend`
- **THEN** Wrangler starts a local Worker dev server with D1 local emulation

#### Scenario: Backend deploys to Cloudflare Workers
- **WHEN** `bun run deploy` is run in `apps/backend`
- **THEN** Wrangler bundles and deploys the Worker to Cloudflare

### Requirement: Frontend workspace is a Vite + React SPA
The `apps/frontend` workspace SHALL use Vite (latest stable) with the React plugin, TypeScript, TanStack Router (file-based routing), TanStack Query, and TanStack Table. Tailwind CSS v4 SHALL be configured for styling.

#### Scenario: Frontend starts with Vite dev server
- **WHEN** `bun run dev` is run in `apps/frontend`
- **THEN** Vite starts a local dev server on port 5173

#### Scenario: Frontend builds for production
- **WHEN** `bun run build` is run in `apps/frontend`
- **THEN** Vite outputs a static build to `apps/frontend/dist`

### Requirement: Shared package provides TypeScript types for API contracts
The `packages/shared` workspace SHALL export TypeScript interfaces/types for all API request and response shapes used by both backend and frontend.

#### Scenario: Shared types used by both apps
- **WHEN** `apps/backend` and `apps/frontend` import from `@cedh-pox/shared`
- **THEN** both compile without type errors using the shared DTOs

### Requirement: D1 database migrations are versioned in the repository
The `apps/backend` SHALL contain a `migrations/` directory with numbered SQL migration files. Migrations SHALL be applied via `wrangler d1 migrations apply`.

#### Scenario: Initial migration creates required tables
- **WHEN** the initial migration is applied to a fresh D1 database
- **THEN** the `players`, `matches`, and `match_entries` tables exist with correct schema

#### Scenario: Migration is idempotent on re-apply
- **WHEN** `wrangler d1 migrations apply` is run against a database where migrations are already applied
- **THEN** already-applied migrations are skipped without error

### Requirement: Root package.json provides convenience scripts
The root `package.json` SHALL include scripts to run, build, and deploy all workspaces, e.g., `dev:backend`, `dev:frontend`, `build`, `deploy`.

#### Scenario: Root dev scripts start workspace servers
- **WHEN** `bun run dev:backend` is run at the repo root
- **THEN** the backend dev server starts as if run from `apps/backend`

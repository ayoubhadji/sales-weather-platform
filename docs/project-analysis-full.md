# Project Analysis — Per-file Detailed Report

Date: 2026-08-05

This document contains a concise, actionable one-entry-per-file analysis for the repository. Each entry lists: Purpose, Key observations / risks, and Recommended next actions.

----

## Top-Level

- [README.md](README.md)
  - Purpose: Project overview, architecture, run instructions.
  - Notes: Good high-level description; some paths/reference names (ml-service vs ml/) may be inconsistent with repo layout.
  - Action: Align run instructions with actual folder names and add quick-start commands for common developer workflows.

- [docker-compose.yml](docker-compose.yml)
  - Purpose: Local multi-container orchestration.
  - Notes: Likely contains services for backend, frontend, ml, db; verify environment secrets are not committed.
  - Action: Review env var usage and document how to override for production vs development.

- [.github/workflows/ci.yml](.github/workflows/ci.yml)
  - Purpose: CI pipeline.
  - Notes: Ensure tests run for backend (Jest) and frontend build; confirm secrets usage for deployment steps.
  - Action: Add lint/test matrix entries and artifact publishing if needed.


----

## Backend (backend/api)

- [package.json](backend/api/package.json)
  - Purpose: Backend dependencies and scripts.
  - Notes: Uses NestJS 11 / TypeORM 1.0; `test` uses Jest; `test:debug` uses `tsconfig-paths/register` — check path-alias config in Jest.
  - Action: Fix Jest path alias configuration if tests report "Cannot find module 'src/...'".

- [tsconfig.json / tsconfig.build.json](backend/api/tsconfig.json)
  - Purpose: Compiler config/path aliases.
  - Notes: Ensure `paths` align with `ts-jest` setup in `jest` config.
  - Action: Validate `tsconfig-paths` usage for tests and runtime.

- [src/main.ts](backend/api/src/main.ts)
  - Purpose: Application bootstrap.
  - Notes: Check global validation pipes, CORS, and logger configuration for prod readiness.
  - Action: Add configurable CORS origins via env.

- [src/app.module.ts](backend/api/src/app.module.ts)
  - Purpose: Root module importing features and TypeORM config.
  - Notes: Confirm TypeORM config uses env variables; `synchronize: true` should be dev-only.
  - Action: Switch to migrations for production and lock down `synchronize` behind NODE_ENV.

- [src/auth/*] (auth service/controller/guards/strategies)
  - Purpose: JWT auth, login, guards.
  - Notes: `JwtStrategy` currently uses a hardcoded secret (`my-secret-key`). `AuthService` returns a `user` object (id, name, email, role) and `access_token` — fine for client storage, but secret management and password hashing are dev-mode.
  - Action: Move JWT secret to env, use bcrypt in production, implement token expiry config, consider refresh tokens if needed.

- [src/users/entities/user.entity.ts]
  - Purpose: `User` model; includes `role`, contact fields, and one-to-many `salesTickets`.
  - Notes: No explicit `franchise` table — franchises are `User` with role `FRANCHISE`.
  - Action: Confirm indexing for `email` and consider adding `franchise` metadata if needed.

- [src/sales-ticket/entities/sales-ticket.entity.ts]
  - Purpose: Sales ticket with `user` relation, items, ticketNumber, saleDate, totalAmount.
  - Notes: Tickets are linked to `User` via `user` column. `ticketNumber` generation logic relies on last ID which may race under concurrency.
  - Action: Consider database-generated sequence or unique constraint handling plus transactional creation to avoid collisions.

- [src/sales-ticket/sales-ticket.service.ts]
  - Purpose: Create tickets and scope ticket queries to `user` when role !== ADMIN.
  - Notes: `findAllForUser` enforces per-user scoping correctly. `create` links `user` by `userId` passed from controller (via `req.user.id`). Good security design.
  - Action: Wrap ticket + item creation in a DB transaction when items are created separately; consider returning full ticket with items in creation flow.

- [src/sales-item/*]
  - Purpose: Sales items management and ticket total recalculations.
  - Notes: `updateTicketTotal` recalculates totals when items change, but creation of ticket then items is not transactional — if item creation fails, a ticket with 0 total can remain.
  - Action: Implement a transactional workflow: create ticket and items in one transaction, or provide compensating cleanup on failure.

- [src/products/*]
  - Purpose: Product CRUD, images uploads.
  - Notes: File uploads exist under `uploads/products`; controller/service likely uses `multer` — verify storage handling for Azure/production.
  - Action: Abstract file storage behind upload provider interface to swap local disk with cloud (Azure Blob) in prod.

- [src/promotions/*]
  - Purpose: Promotions CRUD and validation.
  - Notes: Contains `is-after-start-date.validator.ts` — validators present, check edge cases for timezone handling.
  - Action: Add unit tests for date validators and ensure relationships to `product` are eager-loaded where necessary.

- [src/weather/*]
  - Purpose: Weather ingestion and mapping from external API.
  - Notes: `weather-api.service.ts` flagged by linter for `any` usage; consider stronger typing for external API responses.
  - Action: Create typed response interfaces for Open-Meteo responses and add unit tests/mocks.

- [src/reports/*]
  - Purpose: Business reports and AI helper services.
  - Notes: Uses Groq-advisor service for AI prompts; ensure external API keys (if any) are managed by env vars.
  - Action: Add rate limiting and error handling around AI calls.

- [src/predictions/*]
  - Purpose: ML job scheduling and prediction endpoints.
  - Notes: Scheduler present; training code triggers and may rely on external ML service.
  - Action: Harden failures and add graceful fallback when ML service is unavailable.

- Tests (spec files under many modules)
  - Purpose: Unit/e2e tests.
  - Notes: Earlier run reported `Cannot find module 'src/...'` — typical ts-jest path alias issue.
  - Action: Configure `ts-jest` and `moduleNameMapper` or `tsconfigPaths` properly in Jest config and enable `tsconfig-paths/register` in test:debug script.


----

## Frontend (frontend)

- [package.json](frontend/package.json)
  - Purpose: Frontend deps and scripts.
  - Notes: Uses React 19, Vite 8, TypeScript ~6.0; `build` runs `tsc -b` then `vite build`, good for type checking.
  - Action: Ensure CI runs `npm run build` to catch type errors early.

- [vite.config.ts](frontend/vite.config.ts)
  - Purpose: Vite config; dev server, proxy to API.
  - Notes: Verify `server.proxy` points to backend in dev and env var usage for deployments (Vercel/Azure).
  - Action: Add secure defaults and document `VITE_API_URL` usage for environment-specific deployments.

- [src/main.tsx](frontend/src/main.tsx)
  - Purpose: App bootstrap and Context providers.
  - Notes: Ensure `AuthProvider` wraps router to prevent flicker on protected routes.
  - Action: Confirm hydration and SSR not used — irrelevant for Vite SPA.

- [src/App.tsx]
  - Purpose: Routing and role-based route groups (`/admin`, `/franchise`).
  - Notes: Uses `ProtectedRoute` to guard by role; consistent with backend scoping.
  - Action: Add fallback/error boundary and improve lazy-loading for large admin pages.

- [src/context/AuthContext.tsx]
  - Purpose: Keep logged-in user in state and loading flag.
  - Notes: `authService.getUser()` loads from `localStorage`; token and user stored at login.
  - Action: Consider verifying token expiry on startup and refresh pattern.

- [src/services/authService.ts]
  - Purpose: Login/logout and token/user persistence.
  - Notes: Logs `VITE_API_URL` at runtime — remove console logs in production. `getUser` returns parsed localStorage content.
  - Action: Add `Authorization` header interceptor to `api.ts` (axios instance) and centralize token usage.

- [src/services/api.ts]
  - Purpose: Axios instance for API calls.
  - Notes: Ensure `baseURL` uses `import.meta.env.VITE_API_URL` and attaches Bearer token when present.
  - Action: Add response interceptor to handle 401 refresh flow and global error logging.

- [src/context/TicketContext.tsx]
  - Purpose: Cart state for franchises and ticket creation flow.
  - Notes: NewTicket flow creates ticket then items separately — not transactional; frontend should rely on backend to return created ticket id and handle failures gracefully.
  - Action: After backend implements transactional creation, update frontend to POST full ticket + items in one endpoint or handle rollback on failures.

- Pages: `franchise/NewTicket.tsx`, `franchise/ProductMenu.tsx`, `franchise/TicketsHistory.tsx`
  - Purpose: Franchise workflow — menu, new ticket creation, history.
  - Notes: `TicketsHistory` displays tickets returned by `GET /sales-ticket` which is already scoped server-side; verify UI only shows items where `ticket.user.id === user.id` if extra client checks desired.
  - Action: Remove client-side filtering responsibility — trust backend; just surface errors when server returns 403.

- `components/ProtectedRoute.tsx` & `layouts/*`
  - Purpose: Role-based routing and layouts.
  - Notes: Good separation; ensure `ProtectedRoute` checks `loading` from `AuthContext` to avoid redirect loops.
  - Action: Add tests for routing behavior and snapshot tests for major layouts.

- Assets & Public (icons, favicon, images under backend uploads)
  - Purpose: Static assets used by frontend.
  - Notes: Backend stores uploaded product images under `backend/api/uploads/products/` and serves them; confirm CORS and absolute URLs used in frontend.
  - Action: Replace file URLs with CDN/Blob storage in production.


----

## ML Service (ml)

- [ml/app/main.py, model_service.py, data_loader.py]
  - Purpose: FastAPI service that trains and serves ML models.
  - Notes: Requirements specified in `ml/requirements.txt`.
  - Action: Containerize with pinned versions and ensure ML service endpoints are authenticated or network-isolated.


----

## Database

- [database/README.md]
  - Purpose: DB setup instructions.
  - Notes: Confirm sample schema and migration instructions.
  - Action: Add `pg` connection string examples for Neon and local Postgres, and a migrations quick-start.


----

## Deployments / DevOps

- Vercel / Azure / Neon mentions
  - Purpose: Production hosting for frontend/backend and DB.
  - Notes: Ensure `VITE_API_URL`, backend JWT secret, and DB credentials are stored as platform secrets; do not commit them.
  - Action: Provide a `.env.example` with the required env vars and a small checklist for each target platform.

- Dockerfiles (frontend/backend/ml)
  - Purpose: Containerization for deployments.
  - Notes: Confirm multi-stage builds for frontend to reduce image size and runtime user privileges.
  - Action: Add healthchecks and non-root users in Dockerfiles.


----

## Known Issues & Priorities (short)

- High
  - Fix Jest path aliasing so backend tests run in CI. (See `package.json` scripts and `tsconfig`)
  - Replace hardcoded JWT secret with env bound secret and ensure tokens have expiry.
  - Wrap ticket + items creation in DB transactions to avoid orphaned tickets.

- Medium
  - Harden file upload storage for production (Azure Blob or S3) instead of local disk.
  - Strongly type external API responses (weather) and fix linter `any` complaints.

- Low
  - Remove console logs from `authService`; add global axios interceptor for auth header.


----

## Suggested Next Steps (concrete)

1. I can run an automated pass to: read all `src/**/*.ts` and `src/**/*.tsx` files and extract exported symbols, TODO comments, and test coverage markers. This will produce CSV-style output you can filter. Say `Run automated code scan` to proceed.
2. If you prefer, I can immediately implement high-priority fixes in a branch: (a) Jest path alias fix, (b) move JWT secret to env and configure `JwtModule` accordingly, (c) add DB transaction for ticket+items creation. Say `Implement high-priority fixes` and I will start.


----

*End of per-file summary.*
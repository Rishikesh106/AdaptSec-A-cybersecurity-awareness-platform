# AdaptSec Architecture

AdaptSec is structured as a TypeScript `pnpm` monorepo separating presentation (`apps/web`), business logic & authorization (`apps/api`), background job processing (`apps/worker`), shared contracts (`packages/shared`), and persistence (`packages/db`).

## Core Principles

1. **Thin Client Frontend (`apps/web`)**: Next.js App Router + TanStack Query UI renders state returned by `/api/v1/*`. No authoritative scoring, permissions, or risk calculations happen in the browser.
2. **Authoritative REST API (`apps/api`)**: Fastify 5 with Zod validation, Argon2id password hashing, httpOnly JWT + rotating DB-backed refresh cookies, CSRF Origin checks, Helmet headers, and OpenAPI docs at `/api/docs`.
3. **Strict Multi-Tenancy**: Every tenant-owned query scopes by `request.auth.organizationId` derived from the verified session and active `Membership`.
4. **Background Processing (`apps/worker`)**: BullMQ + Redis handles email dispatch, campaign reminders, and asynchronous CSV/PDF (`pdfkit`) report generation, with an inline fallback in `apps/api` when Redis is unavailable in local tests.

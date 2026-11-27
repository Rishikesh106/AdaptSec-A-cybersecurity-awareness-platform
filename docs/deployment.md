# Deployment Guide

## 1. Docker Compose (Recommended)

Copy `.env.example` to `.env` and update secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET`) before production deployment:

```bash
cp .env.example .env
docker compose up --build
```

Services started:
- `postgres` (PostgreSQL 16)
- `redis` (Redis 7)
- `mailpit` (SMTP :1025, Web UI :8025)
- `api` (Fastify on :4000)
- `worker` (BullMQ worker)
- `web` (Next.js on :3000)

## 2. Database Migrations & Seed

```bash
pnpm --filter @adaptsec/db exec prisma migrate deploy
pnpm --filter @adaptsec/db exec tsx prisma/seed.ts
```

## 3. Health Checks

- `GET /health` — liveness probe
- `GET /ready` — database connectivity probe
- `GET /api/docs` — interactive OpenAPI / Swagger UI

FROM node:22-alpine AS base
RUN corepack enable pnpm
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY apps/api/package.json apps/api/

RUN pnpm install --frozen-lockfile || pnpm install

COPY packages/shared packages/shared
COPY packages/db packages/db
COPY apps/api apps/api

RUN pnpm --filter @adaptsec/shared build && pnpm --filter @adaptsec/db build && pnpm --filter @adaptsec/api build

EXPOSE 4000
CMD ["sh", "-c", "pnpm --filter @adaptsec/db migrate:deploy && node apps/api/dist/server.js"]

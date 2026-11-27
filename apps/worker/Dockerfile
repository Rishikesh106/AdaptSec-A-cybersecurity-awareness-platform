FROM node:22-alpine AS base
RUN corepack enable pnpm
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY apps/worker/package.json apps/worker/

RUN pnpm install --frozen-lockfile || pnpm install

COPY packages/shared packages/shared
COPY packages/db packages/db
COPY apps/worker apps/worker

RUN pnpm --filter @adaptsec/shared build && pnpm --filter @adaptsec/db build && pnpm --filter @adaptsec/worker build

CMD ["node", "apps/worker/dist/index.js"]

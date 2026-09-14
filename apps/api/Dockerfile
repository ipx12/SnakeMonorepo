# Multi-stage Dockerfile for Express API service in SnakeMonorepo
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 1: Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN npm ci

# Stage 2: Build the API application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json turbo.json ./
COPY packages/types ./packages/types
COPY apps/api ./apps/api

RUN npm run build --workspace=api

# Stage 3: Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_URL=file:/app/data/sqlite.db

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Prepare persistent data directory for SQLite database
RUN mkdir -p /app/data && chown -R expressjs:nodejs /app/data

# Copy workspace dependencies and built artifacts
COPY --from=deps --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=expressjs:nodejs /app/packages/types ./packages/types
COPY --from=builder --chown=expressjs:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=expressjs:nodejs /app/apps/api/dist ./apps/api/dist

USER expressjs

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]

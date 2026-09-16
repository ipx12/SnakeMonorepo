# Multi-stage Dockerfile for Express API service in SnakeMonorepo (Turborepo Pruned)
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 1: Prune workspace
FROM base AS pruner
# Install turbo globally to use the prune command
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune api --docker

# Stage 2: Install dependencies
FROM base AS installer
# Copy only the pruned package.json files and lockfile
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

# Stage 3: Build the API application
FROM base AS builder
COPY --from=installer /app/node_modules ./node_modules
# Copy the pruned source code
COPY --from=pruner /app/out/full/ .

RUN npm run build --workspace=api

# Prune devDependencies to keep the production image lightweight
RUN npm prune --omit=dev

# Stage 4: Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_URL=file:/app/data/sqlite.db

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Prepare persistent data directory for SQLite database
RUN mkdir -p /app/data && chown -R expressjs:nodejs /app/data

# Copy workspace dependencies (now without devDependencies) and built artifacts
COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=expressjs:nodejs /app/packages/types ./packages/types
COPY --from=builder --chown=expressjs:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=expressjs:nodejs /app/apps/api/dist ./apps/api/dist

USER expressjs

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]

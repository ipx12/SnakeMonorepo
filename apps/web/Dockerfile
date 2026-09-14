# Multi-stage Dockerfile for Next.js web service in SnakeMonorepo
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

# Stage 2: Build the Next.js application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json turbo.json ./
COPY packages/types ./packages/types
COPY apps/web ./apps/web

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build --workspace=web

# Stage 3: Production runner using Next.js standalone mode
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build output, public assets, and static files
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]

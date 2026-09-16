# Multi-stage Dockerfile for Next.js web service in SnakeMonorepo (Turborepo Pruned)
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 1: Prune workspace
FROM base AS pruner
# Install turbo globally to use the prune command
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune web --docker

# Stage 2: Install dependencies
FROM base AS installer
# Copy only the pruned package.json files and lockfile
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

# Stage 3: Build the Next.js application
FROM base AS builder
COPY --from=installer /app/node_modules ./node_modules
# Copy the pruned source code
COPY --from=pruner /app/out/full/ .

ARG INTERNAL_API_URL=http://api:3001
ENV INTERNAL_API_URL=$INTERNAL_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build --workspace=web

# Stage 4: Production runner using Next.js standalone mode
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

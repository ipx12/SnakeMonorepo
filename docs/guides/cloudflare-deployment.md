# Cloudflare Deployment Guide

This guide details how to deploy the **SnakeMonorepo** full-stack application to **Cloudflare** using **Cloudflare Workers** (for Hono API) and **Cloudflare Pages / Workers Assets** (for Next.js with OpenNext).

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │            Cloudflare Edge             │
                      │                                        │
Client Browser ───────┼──> snake-web (.open-next / Next.js)   │
                      │         │                              │
                      │         ├── (SSR / API Calls)          │
                      │         ▼                              │
                      │    snake-api (Hono Worker)             │
                      └─────────┼──────────────────────────────┘
                                │
                                ▼
                       Turso Database (libSQL)
```

1. **Frontend (`apps/web`)**: Next.js App Router bundled via `@opennextjs/cloudflare` with static assets served via Cloudflare Workers Assets. Features a native API catch-all proxy (`src/app/api/[...path]/route.ts`) ensuring all client authentication and data requests operate on the same first-party origin, preventing cross-subdomain cookie drops on `*.workers.dev`.
2. **Cloudflare Service Bindings (`dispatchApiRequest`)**: All requests from the Web worker to the Hono API worker are dispatched in-process via Cloudflare Service Bindings (`env.API` -> `snakemonorepo`), completely eliminating Cloudflare Error 1003 (`Direct IP access not allowed`).
3. **Backend (`apps/api`)**: Modular Hono API exported as a native Cloudflare Worker (`src/worker.ts`), using `nodejs_compat` and Kysely with Libsql dialect.
4. **Database**: Managed remote **Turso** database (`libsql://...`) accessed over HTTPS/WebSockets without requiring local disk storage.
5. **Edge SSR Authentication Guard**: Server Components verify authentication sessions via `getServerSession()` forwarding incoming cookies to the API backend via Service Bindings.

---

## 1. Prerequisites

1. Cloudflare account authenticated via Wrangler:
   ```bash
   npx wrangler login
   ```
2. Turso database created and credentials saved:
   ```bash
   turso db create snake-db
   turso db show snake-db --url
   turso db tokens create snake-db
   ```

---

## 2. Deploying Hono API (`apps/api`)

### Configuration

The worker configuration is located at [`apps/api/wrangler.jsonc`](file:///d:/WEB/SnakeMonorepo/apps/api/wrangler.jsonc):
* Entry point: [`src/worker.ts`](file:///d:/WEB/SnakeMonorepo/apps/api/src/worker.ts)
* Compatibility: `nodejs_compat`, `nodejs_compat_populate_process_env`

### Setting Production Secrets

In the `apps/api` directory, configure your production secrets:

```bash
cd apps/api
npx wrangler secret put DATABASE_URL
# Input: libsql://<your-turso-database-url>

npx wrangler secret put TURSO_AUTH_TOKEN
# Input: <your-turso-auth-token>

npx wrangler secret put BETTER_AUTH_SECRET
# Input: <strong-random-secret>

npx wrangler secret put BETTER_AUTH_URL
# Input: https://snake-api.<your-subdomain>.workers.dev
```

### Dry Run & Deploy

```bash
# Verify bundle locally
npm --workspace=api run dev:worker

# Dry run deployment verification
npx wrangler deploy --dry-run

# Deploy to Cloudflare Workers
npm --workspace=api run deploy
```

Once deployed, note your Worker URL (e.g., `https://snake-api.<your-subdomain>.workers.dev`).

---

## 3. Deploying Next.js Web (`apps/web`)

### Configuration

* Config: [`apps/web/wrangler.jsonc`](file:///d:/WEB/SnakeMonorepo/apps/web/wrangler.jsonc)
* Adapter config: [`apps/web/open-next.config.ts`](file:///d:/WEB/SnakeMonorepo/apps/web/open-next.config.ts)
* Build artifact: `.open-next/worker.js` + `.open-next/assets`

### Setting Environment Variables

Set the API URL to point to your deployed `snake-api` worker:

```bash
cd apps/web
npx wrangler secret put NEXT_PUBLIC_API_URL
# Input: https://snake-api.<your-subdomain>.workers.dev/api

npx wrangler secret put INTERNAL_API_URL
# Input: https://snake-api.<your-subdomain>.workers.dev
```

### Build & Deploy

```bash
# Build with OpenNext adapter
npm --workspace=web run build:worker

# Dry run verification
npx wrangler deploy --dry-run

# Deploy to Cloudflare
npm --workspace=web run deploy
```

---

## 4. Local Development with Cloudflare Emulation

To test both services locally in Cloudflare's runtime:

```bash
# In terminal 1 (API worker):
npm --workspace=api run dev:worker

# In terminal 2 (Web worker):
npm --workspace=web run preview:worker
```

---

## 5. Automated CI/CD via GitHub Actions

The repository includes an automated deployment workflow at [`.github/workflows/deploy.yml`](file:///d:/WEB/SnakeMonorepo/.github/workflows/deploy.yml).

### Workflow Architecture
1. **Test & Lint Job**: Runs Turborepo lint (`npm run lint`) and all 90 unit/integration test suites (`npm run test`) across workspaces.
2. **Deploy API Worker**: Uses `cloudflare/wrangler-action@v3` to deploy the Hono API worker (`snakemonorepo`).
3. **Deploy Web Worker**: Compiles the Next.js OpenNext bundle on native Ubuntu Linux (`npm --workspace=web run build:worker`) and deploys the `snake-web` worker and assets with `cloudflare/wrangler-action@v3`.

### Required GitHub Secrets
Configure the following secrets in GitHub (**Settings > Secrets and variables > Actions**):

| Secret Name | Value Description |
| :--- | :--- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with `Workers:Edit` and `Pages:Edit` permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID (`48a1bdf46299165fe767c32011694c5c`) |
| `TURSO_AUTH_TOKEN` | Turso Database authentication token |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth signing |

### Live Endpoints
- **Hono API Worker**: `https://snakemonorepo.ipx12.workers.dev`
- **Next.js Web Worker**: `https://snake-web.ipx12.workers.dev`

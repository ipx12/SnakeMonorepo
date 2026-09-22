# 🏗️ System Architecture Overview

The project is architected as a modular monorepo orchestrated by **Turborepo** and native **npm workspaces**.

---

## Workspace Structure

```
SnakeMonorepo/
├── apps/
│   ├── web/           # Frontend: Next.js App Router (Port 3000)
│   └── api/           # Backend: Hono REST API (Port 3001)
├── packages/
│   └── types/         # Shared: TypeScript models, Zod validation schemas, DTOs
├── docs/              # Engineering documentation & guides
├── sqlite.db          # Local SQLite database file
└── turbo.json         # Turborepo task pipeline configuration
```

---

## Backend Layered Architecture (`apps/api`)

The backend follows a strict **Layered Architecture** adhering to the **Single Responsibility Principle (SRP)**:

```
  Incoming HTTP Request
           │
           ▼
 1. [routes]        ──► task.routes.ts, admin.routes.ts
           │
           ▼
 2. [middlewares]   ──► auth.middleware.ts, validate.middleware.ts
           │
           ▼
 3. [controllers]   ──► task.controller.ts, admin.controller.ts
           │
           ▼
 4. [services]      ──► task.service.ts, admin.service.ts
           │
           ▼
 5. [database]      ──► SQLite (Kysely + Libsql Dialect)
```

### Layer Responsibilities:
1. **Routes (`src/routes/`)**: Map HTTP methods and paths to controller handlers and bind middleware pipelines.
2. **Middlewares (`src/middlewares/`)**: Intercept and validate sessions (Better Auth), role permissions (RBAC), and request payloads via shared Zod schemas (`validateRequestBody`, `validateRequestParams`, `validateRequestQuery`).
3. **Controllers (`src/controllers/`)**: Handle HTTP requests, extract parameters/body, invoke business services, and dispatch HTTP status codes and JSON responses.
4. **Services (`src/services/`)**: Encapsulate pure business logic, default data seeding, and type-safe Kysely SQL queries.
5. **Database**: Kysely query execution layer connecting to the local `sqlite.db` file.

---

## Frontend Architecture (`apps/web`)

* **Next.js App Router (RSC & Client Containers)**:
  * **Server Component Pages (`src/app/`)**: Lightweight server-rendered entrypoints (`/`, `/login`, `/register`, `/admin/users`) that perform server-side session checks and forward validated props down to client containers.
  * **Feature Containers (`src/components/`)**: Client-side interactive components (`DashboardContainer`, `AdminUsersContainer`, `LoginForm`, `RegisterForm`) isolated with `'use client'`.
  * **SSR Route Protection (`src/lib/auth-server.ts`)**: Secure server-side session retrieval (`getServerSession`) forwarding cookies and headers with `cache: 'no-store'` and timeout safeguards.
* **Server State Management (TanStack Query v5)**:
  * **Architecture & Providers**: Root `<QueryProvider>` utilizing the official `getQueryClient()` singleton pattern with `isServer` check to preserve cache across React Suspense boundaries.
  * **Encapsulated Hooks (`src/hooks/`)**: Reusable data hooks (`useTasks`, `useAdminUsers`) with optimistic updates and automatic rollback.
  * **Query Options (`src/lib/query-options.ts`)**: Centralized `queryOptions` integrating query keys and fetch calls with `AbortSignal` cancellation.
  * **SSR Prefetching & Hydration**: Server Components prefetch data with dedicated, isolated `new QueryClient()` instances via `queryClient.query({ ... }).catch(noop)` and hydrate client trees via `<HydrationBoundary state={dehydrate(queryClient)}>`.
  * **Session Isolation**: Automatic `queryClient.clear()` on logout prevents cross-user stale cache persistence.
* **Watermelon UI Design System**: Tailored UI primitives built on Radix UI and Tailwind CSS v4 (`components/ui/`).
* **Authentication**: Native Better Auth hooks (`useSession`, `signIn`, `signUp`) powered by the browser client (`authClient`), paired with server-side authentication guards.
* **Forms & Validation**: `react-hook-form` paired with `@hookform/resolvers/zod` consuming schemas directly from `@snake/types`.

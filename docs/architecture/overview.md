# 🏗️ System Architecture Overview

The project is architected as a modular monorepo orchestrated by **Turborepo** and native **npm workspaces**.

---

## Workspace Structure

```
SnakeMonorepo/
├── apps/
│   ├── web/           # Frontend: Next.js App Router (Port 3000)
│   └── api/           # Backend: Express REST API (Port 3001)
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

* **Next.js App Router**: Server and Client Components optimized for responsiveness and rendering performance.
* **Watermelon UI Design System**: Tailored UI primitives built on Radix UI and Tailwind CSS v4.
* **Authentication**: Native Better Auth hooks (`useSession`, `signIn`, `signUp`) powered by the browser client (`authClient`).
* **Forms & Validation**: `react-hook-form` paired with `@hookform/resolvers/zod` consuming schemas directly from `@snake/types`.

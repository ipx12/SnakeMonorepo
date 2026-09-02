# 📚 SnakeMonorepo Documentation

Welcome to the engineering documentation for **SnakeMonorepo** — a modern fullstack monorepo featuring clear client, server, and shared layers.

---

## 🧭 Documentation Index

### 1. System Architecture ([`docs/architecture/`](./architecture/overview.md))
* [**Architecture Overview**](./architecture/overview.md) — Monorepo structure, backend layered architecture, and Next.js client rendering.
* [**Database & Schema**](./architecture/database-schema.md) — Kysely query builder, SQLite schema, index optimization, and batch operations.
* [**Authentication & RBAC**](./architecture/rbac-security.md) — Better Auth, session lifecycle, and user roles (`Admin`, `User`, `Guest`).

### 2. API Specifications ([`docs/api/`](./api/tasks-api.md))
* [**Tasks API**](./api/tasks-api.md) — `/api/tasks` endpoints (CRUD operations and automatic task seeding).
* [**Admin API**](./api/admin-api.md) — `/api/admin/users` endpoints (server-side pagination, search, and metadata).

### 3. Developer Guides ([`docs/guides/`](./guides/development-workflow.md))
* [**Development Workflow**](./guides/development-workflow.md) — Turborepo commands, Vitest/Supertest testing strategy, and semantic naming conventions.
* [**End-to-End Zod Validation**](./guides/validation-guide.md) — Centralized Zod schemas in `@snake/types` consumed across React Hook Form and Express.

---

## ⚡ Quick Start

```bash
# 1. Install all workspace dependencies
npm install

# 2. Start frontend (:3000) and backend (:3001) in development mode
npm run dev

# 3. Execute all monorepo test suites (47 tests)
npm run test

# 4. Create production build
npm run build
```

# 🛠️ Development Workflow Guide

---

## 1. Core Monorepo Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launch frontend (`localhost:3000`) and backend (`localhost:3001`) concurrently via Turborepo |
| `npm run test` | Run all 90 tests across workspaces (Vitest, Supertest, React Testing Library) |
| `npm run build` | Compile TypeScript and build Next.js production bundle |
| `npm run clean` | Clean all build artifacts (`.turbo`, `dist`, `.next`) |

---

## 2. Testing Infrastructure & Strategy

The monorepo features a layered automated testing suite executed via Vitest (**90 total tests**):

### Suite Breakdown

| Scope | Package | Test Files | Count | Focus |
| :--- | :--- | :--- | :---: | :--- |
| **Validation Layer** | `@snake/types` | [`schemas.test.ts`](file:///d:/WEB/SnakeMonorepo/apps/web/src/__tests__/schemas.test.ts) | 13 | Shared Zod schemas, boundary values, type coercion |
| **Backend Services** | `apps/api` | [`services.test.ts`](file:///d:/WEB/SnakeMonorepo/apps/api/src/__tests__/services.test.ts) | 7 | Kysely database queries, task CRUD, admin user pagination |
| **API Endpoints & RBAC** | `apps/api` | [`tasks.test.ts`](file:///d:/WEB/SnakeMonorepo/apps/api/src/__tests__/tasks.test.ts) | 18 | Hono endpoints, Supertest, multi-tenant isolation, admin overrides, 401/403/404 handling |
| **Server State Hooks** | `apps/web` | [`useTasks.test.tsx`](file:///d:/WEB/SnakeMonorepo/apps/web/src/__tests__/useTasks.test.tsx), [`useAdminUsers.test.tsx`](file:///d:/WEB/SnakeMonorepo/apps/web/src/__tests__/useAdminUsers.test.tsx) | 11 | TanStack Query v5 optimistic updates, cache rollback, 300ms search debounce |
| **Authentication UI** | `apps/web` | [`LoginForm.test.tsx`](file:///d:/WEB/SnakeMonorepo/apps/web/src/__tests__/LoginForm.test.tsx), [`RegisterForm.test.tsx`](file:///d:/WEB/SnakeMonorepo/apps/web/src/__tests__/RegisterForm.test.tsx), [`Navbar.test.tsx`](file:///d:/WEB/SnakeMonorepo/apps/web/src/__tests__/Navbar.test.tsx) | 14 | Form validation, demo fill, role-based nav links, sign out |
| **Pages & Components** | `apps/web` | [`pages.test.tsx`](file:///d:/WEB/SnakeMonorepo/apps/web/src/__tests__/pages.test.tsx), [`TaskList.test.tsx`](file:///d:/WEB/SnakeMonorepo/apps/web/src/__tests__/TaskList.test.tsx), [`AdminUsersContainer.test.tsx`](file:///d:/WEB/SnakeMonorepo/apps/web/src/__tests__/AdminUsersContainer.test.tsx), [`sonner.test.tsx`](file:///d:/WEB/SnakeMonorepo/apps/web/src/__tests__/sonner.test.tsx) | 27 | SSR page hydration, task inline editing, degraded error states, table pagination |

### Key Principles
1. **Behavior-Driven**: UI tests use `@testing-library/react` and `@testing-library/user-event` to simulate real user interactions.
2. **Security & Ownership First**: Cross-user mutation attempts are tested for `403 Forbidden` responses.
3. **Error Resilience**: Pages and containers are tested under simulated API rejections to verify graceful error banner display without UI crashes.
4. **Cache & Test Isolation**: Clean `QueryClient` per test, deterministic SQLite test fixtures, and `beforeEach` mock clearing.

---

## 3. Code Conventions (Semantic Variable Naming & Strict Types)

* **Semantic Naming Standard**: All variables, parameters, and function names must be self-descriptive and semantic.
  * ❌ **Avoid**: `u`, `q`, `e`, `i`, `data`, `res`, `items`, `loading`, `error`.
  * ✅ **Use**: `taskList`, `isTasksLoading`, `newTaskTitle`, `editingTask`, `errorMessage`, `event`, `targetTask`, `taskId`, `httpRequest`, `httpResponse`.
* **Zero `any` Standard**: Usage of `any` is prohibited. Use strongly-typed Kysely schemas (`Selectable<Table>`), Zod inferred types, or `unknown` with type guards.
* **JSDoc / TSDoc Documentation Standard**: All service functions (`services/*.ts`), API client methods (`lib/api.ts`), custom hooks (`hooks/*.ts`), and Zod validation schemas (`packages/types`) must be documented with JSDoc annotations (`@param`, `@returns`, `@throws`, `@example`).

---

## 4. Contribution & Change Lifecycle
1. **Define Shared Contracts**: Write shared models and Zod schemas in `@snake/types`.
2. **Implement Handlers & Logic**: Build backend endpoints (`services/`, `controllers/`, `routes/`) or frontend UI components.
3. **Write Unit & Integration Tests**: Add automated tests covering happy path, RBAC authorization, and degraded error states.
4. **Run Verification Suite**: Verify zero linter warnings and 100% test pass rate (`npm run lint` and `npm run test`).
5. **Mandatory Documentation Validation**: Always review, validate, and synchronize both [`AGENTS.md`](../../AGENTS.md) and all relevant guides/specs in [`docs/`](../README.md) (`README.md`, `architecture/`, `api/`, `guides/`) so all test counts, endpoint contracts, and architecture patterns stay accurate.

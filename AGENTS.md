<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# SnakeMonorepo AGENTS.md

## Project Overview

Monorepo containing Next.js frontend (`apps/web`) and Express backend (`apps/api`).

## Key Technologies & Conventions

### 1. UI Library & Styling

- **UI System**: Use **Watermelon UI** design components (built with Radix UI primitives, Sonner & Tailwind CSS v4 located in `src/components/ui/`).
- **Design Aesthetic**: Premium dark mode, glassmorphism, subtle micro-animations, and vibrant gradients.
- **Toast Notifications**: Built on **Sonner** (`apps/web/src/components/ui/sonner.tsx`) with dark glassmorphism styling, mounted globally via `<Toaster />` in `apps/web/src/app/layout.tsx`. Supports `toast.success`, `toast.error`, `toast.info`, and action buttons.

### 2. Authentication & Authorization (RBAC)

- **Auth Provider**: **Better Auth** (`better-auth`).
- **Frontend Client**: `authClient` from [`src/lib/auth-client.ts`](file:///d:/WEB/SnakeMonorepo/apps/web/src/lib/auth-client.ts) consumed via native hooks (`useSession`, `signIn`, `signUp`).
- **Backend Auth Endpoint**: Express API mounted at `http://localhost:3001/api/auth/*`.
- **Default Demo Account**: `demo@watermelon.ui` / `password123`.
- **Role-Based Access Control (RBAC)**: User roles defined in [`src/lib/roles.ts`](file:///d:/WEB/SnakeMonorepo/apps/web/src/lib/roles.ts) (`UserRole.Admin`, `UserRole.User`, `UserRole.Guest`).
- **Admin Dashboard**: Route `/admin/users` for administrators to view, search, and manage user accounts and session details.

### 3. Forms & Shared Validation Layer (End-to-End Zod)

- **Form State Management**: **React Hook Form** (`react-hook-form`).
- **Schema Validation**: **Zod** (`zod`).
- **Shared Validation Schemas**: Centralized in `@snake/types` (`loginSchema`, `registerSchema`, `createTaskSchema`, `updateTaskSchema`, `taskIdParamSchema`, `adminUsersQuerySchema`).
- **Backend Request Validation**: Express middleware (`validateRequestBody`, `validateRequestQuery`, `validateRequestParams`) leveraging shared Zod schemas.
- **Frontend Schema Resolver**: `@hookform/resolvers/zod` (`zodResolver`).

### 4. Monorepo Architecture, Database & Optimization

- **Frontend (`apps/web`)**: Next.js App Router on Port 3000 with Optimistic UI updates and Debounced Search.
- **Backend (`apps/api`)**: Layered Express server on Port 3001:
  - **Routes (`src/routes/`)**: Route definitions and middleware binding (`task.routes.ts`, `admin.routes.ts`).
  - **Controllers (`src/controllers/`)**: HTTP request/response handlers (`task.controller.ts`, `admin.controller.ts`).
  - **Services (`src/services/`)**: Business logic and database operations (`task.service.ts`, `admin.service.ts`).
  - **Middlewares (`src/middlewares/`)**: Reusable auth and validation handlers (`auth.middleware.ts`, `validate.middleware.ts`).
- **Shared Types & Schemas (`packages/types`)**: Package `@snake/types` containing shared TypeScript interfaces (`DatabaseSchema`), enums (`UserRole`), Zod schemas, API payloads, and pagination models (`PaginationMeta`, `AdminUsersResponse`, `AdminUsersQueryParams`).
- **Database**: SQLite (`file:sqlite.db`) using **Kysely** query builder with **Libsql Dialect** (`@libsql/kysely-libsql`), configured with `WAL` journal mode and `busy_timeout` to prevent locking.
- **Database Schema & Indices**:
  - `user`: User account details (`id`, `name`, `email`, `role`, `createdAt`, `updatedAt`).
  - `session`: User authentication sessions (`id`, `token`, `expiresAt`, `userId`). Index: `idx_session_userId` on `session(userId)`.
  - `task`: User task dashboard items (`id`, `title`, `description`, `completed`, `userId`, `createdAt`). Index: `idx_task_userId` on `task(userId)`.
- **Query Optimization**: Secure `crypto.randomUUID()` identifier generation, and SQL-level server-side pagination & filtering for `/api/admin/users`.

### 5. Testing Infrastructure & Strategy

- **Test Runner**: **Vitest** for both `apps/web` and `apps/api`.
- **API Integration Testing**: **Supertest** for testing Express endpoints in `apps/api` without running network ports (`items.test.ts`).
- **Service Layer Unit Testing**: Direct database and business logic testing in `apps/api/src/__tests__/services.test.ts`.
- **Zod Schema Unit Testing**: Validation edge cases testing in `apps/web/src/__tests__/schemas.test.ts`.
- **UI Testing**: **React Testing Library** (`@testing-library/react`, `@testing-library/jest-dom`) with `jsdom` for `apps/web` component integration tests.
- **Monorepo Execution**: Run all workspace tests via `npm run test` (`turbo run test`). Total 43 unit & integration tests across workspaces.

### 6. Directory Structure Conventions

- `apps/web/src/app/`: Next.js pages, layouts, and routes (`/`, `/login`, `/register`, `/admin/users`).
- `apps/web/src/components/`: Visual UI components (`components/ui` for primitives, `components/dashboard` for feature widgets).
- `apps/web/src/lib/`: Business logic, API calls (`api.ts`), roles definition (`roles.ts`), authentication client (`auth-client.ts`), and helper utilities.
- `apps/api/src/controllers/`: Express route controllers.
- `apps/api/src/services/`: Database and business logic operations.
- `apps/api/src/routes/`: Express modular route definitions.
- `apps/api/src/middlewares/`: Express authentication and validation middlewares.
- `packages/types/`: Shared TypeScript models, interfaces, and Zod schemas (`@snake/types`).

### 7. Code Naming Conventions

- **Semantic Naming**: All variable names, parameters, functions, and state values MUST be self-descriptive and semantic (e.g. `taskList`, `isTasksLoading`, `newTaskTitle`, `editingTask`, `errorMessage`, `event`, `targetTask`, `taskId`). Avoid single-letter variables (like `u`, `q`, `e`, `i`, `val`) or non-descriptive names (like `data`, `res`, `items`, `loading`, `error`).

### 8. Responsive Design & Mobile-First Standard (320px+)

- **Baseline Viewport**: All UI components and layouts must support mobile viewports starting from a minimum width of **320px** without horizontal scroll (`scrollWidth <= innerWidth`), content clipping, or broken layouts.
- **Layout Constraints**: Use fluid typography (`text-2xl sm:text-4xl`), responsive padding (`px-3 sm:px-6`), `min-w-0` on flex children, and isolated `overflow-x-auto` for wide components (tables/code blocks).
- **Verification**: When introducing new pages or major UI sections, verify responsive integrity across 320px, 768px, and 1280px viewports using Playwright or browser checks.

## AGENTS.md Maintenance Policy

1. **Automated Documentation**: Whenever new technologies, routes, endpoints, or features are added or updated in the project, `AGENTS.md` must be updated to document them.
2. **User Confirmation Prompt**: Always ask the user if newly introduced technologies or features should be added to `AGENTS.md`.
3. **Semantic Naming Standard**: Ensure all newly written or modified code strictly adheres to the semantic variable naming rule.

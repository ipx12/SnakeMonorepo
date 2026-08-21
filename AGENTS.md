<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# SnakeMonorepo AGENTS.md

## Project Overview

Monorepo containing Next.js frontend (`apps/web`) and Express backend (`apps/api`).

## Key Technologies & Conventions

### 1. UI Library & Styling

- **UI System**: Use **Watermelon UI** design components (built with Radix UI primitives & Tailwind CSS v4 located in `src/components/ui/`).
- **Design Aesthetic**: Premium dark mode, glassmorphism, subtle micro-animations, and vibrant gradients.

### 2. Authentication & Authorization (RBAC)

- **Auth Provider**: **Better Auth** (`better-auth`).
- **Frontend Client**: `authClient` from [`src/lib/auth-client.ts`](file:///d:/WEB/SnakeMonorepo/apps/web/src/lib/auth-client.ts) consumed via [`AuthContext`](file:///d:/WEB/SnakeMonorepo/apps/web/src/lib/AuthContext.tsx).
- **Backend Auth Endpoint**: Express API mounted at `http://localhost:3001/api/auth/*`.
- **Default Demo Account**: `demo@watermelon.ui` / `password123`.
- **Role-Based Access Control (RBAC)**: User roles defined in [`src/lib/roles.ts`](file:///d:/WEB/SnakeMonorepo/apps/web/src/lib/roles.ts) (`UserRole.Admin`, `UserRole.User`, `UserRole.Guest`).
- **Admin Dashboard**: Route `/admin/users` for administrators to view, search, and manage user accounts and session details.

### 3. Forms & Validation

- **Form State Management**: **React Hook Form** (`react-hook-form`).
- **Schema Validation**: **Zod** (`zod`).
- **Schema Resolver**: `@hookform/resolvers/zod` (`zodResolver`).

### 4. Monorepo Architecture & Database

- **Frontend (`apps/web`)**: Next.js App Router on Port 3000.
- **Backend (`apps/api`)**: Express server on Port 3001 (`/api/admin/users` for admin endpoints).
- **Database**: SQLite (`file:sqlite.db`) using **Kysely** query builder with **Libsql Dialect** (`@libsql/kysely-libsql`).
- **Database Schema**:
  - `user`: User account details (`id`, `name`, `email`, `role`, `createdAt`, `updatedAt`).
  - `session`: User authentication sessions (`id`, `token`, `expiresAt`, `userId`).
  - `task`: User task dashboard items (`id`, `title`, `description`, `completed`, `userId`, `createdAt`). Tasks are fully persisted in SQLite across API server restarts.

### 5. Testing Infrastructure & Strategy

- **Test Runner**: **Vitest** for both `apps/web` and `apps/api`.
- **API Testing**: **Supertest** for testing Express endpoints in `apps/api` without running network ports.
- **UI Testing**: **React Testing Library** (`@testing-library/react`, `@testing-library/jest-dom`) with `jsdom` for `apps/web` component integration tests.
- **Monorepo Execution**: Run all workspace tests via `npm run test` (`turbo run test`).

### 6. Directory Structure Conventions

- `apps/web/src/app/`: Next.js pages, layouts, and routes (`/`, `/login`, `/register`, `/admin/users`).
- `apps/web/src/components/`: Visual UI components (`components/ui` for primitives, `components/dashboard` for feature widgets).
- `apps/web/src/lib/`: Business logic, API calls (`api.ts`), roles definition (`roles.ts`), authentication client (`auth-client.ts`), and helper utilities.
- `apps/api/src/`: Express backend code, database connections, and routes.

### 6. Code Naming Conventions

- **Semantic Naming**: All variable names, parameters, functions, and state values MUST be self-descriptive and semantic (e.g. `taskList`, `isTasksLoading`, `newTaskTitle`, `editingTask`, `errorMessage`, `event`, `targetTask`, `taskId`). Avoid single-letter variables (like `u`, `q`, `e`, `i`, `val`) or non-descriptive names (like `data`, `res`, `items`, `loading`, `error`).

## AGENTS.md Maintenance Policy

1. **Automated Documentation**: Whenever new technologies, routes, endpoints, or features are added or updated in the project, `AGENTS.md` must be updated to document them.
2. **User Confirmation Prompt**: Always ask the user if newly introduced technologies or features should be added to `AGENTS.md`.
3. **Semantic Naming Standard**: Ensure all newly written or modified code strictly adheres to the semantic variable naming rule.

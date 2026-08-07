<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Conventions & Architecture (Watermelon UI Monorepo)

## 1. UI Library & Styling
- **UI System**: Use **Watermelon UI** design components (built with Radix UI & Tailwind CSS v4 primitives located in `src/components/ui/`).
- **Design Aesthetic**: Premium dark mode, glassmorphism, subtle micro-animations, and vibrant gradients.

## 2. Authentication & Authorization
- **Auth Provider**: **Better Auth** (`better-auth`).
- **Frontend Client**: `authClient` from [`src/lib/auth-client.ts`](file:///d:/WEB/SnakeMonorepo/apps/web/src/lib/auth-client.ts) consumed via [`AuthContext`](file:///d:/WEB/SnakeMonorepo/apps/web/src/lib/AuthContext.tsx).
- **Backend Auth Endpoint**: Express API mounted at `http://localhost:3001/api/auth/*`.
- **Default Demo Account**: `demo@watermelon.ui` / `password123`.

## 3. Forms & Validation
- **Form State Management**: **React Hook Form** (`react-hook-form`).
- **Schema Validation**: **Zod** (`zod`).
- **Schema Resolver**: `@hookform/resolvers/zod` (`zodResolver`).

## 4. Monorepo Architecture & Database
- **Frontend (`apps/web`)**: Next.js App Router on Port 3000.
- **Backend (`apps/api`)**: Express server on Port 3001.
- **Database**: SQLite (`file:sqlite.db`) using **Kysely** with **Libsql Dialect** (`@libsql/kysely-libsql`).

## 5. Directory Structure Conventions
- `src/app/`: Next.js pages, layouts, and routes (`/`, `/login`, `/register`).
- `src/components/`: Visual UI components (`components/ui` for primitives, `components/dashboard` for feature widgets).
- `src/lib/`: Business logic, API calls (`api.ts`), authentication client (`auth-client.ts`), and helper utilities.

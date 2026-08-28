# 🛠️ Development Workflow Guide

---

## 1. Core Monorepo Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launch frontend (`localhost:3000`) and backend (`localhost:3001`) concurrently via Turborepo |
| `npm run test` | Run all 43 tests across workspaces (Vitest, Supertest, React Testing Library) |
| `npm run build` | Compile TypeScript and build Next.js production bundle |
| `npm run clean` | Clean all build artifacts (`.turbo`, `dist`, `.next`) |

---

## 2. Code Conventions (Semantic Variable Naming)

The project adheres to a strict semantic variable naming standard: **all variables, parameters, and function names must be self-descriptive and semantic**.

* ❌ **Avoid**: `u`, `q`, `e`, `i`, `data`, `res`, `items`, `loading`, `error`.
* ✅ **Use**: `taskList`, `isTasksLoading`, `newTaskTitle`, `editingTask`, `errorMessage`, `event`, `targetTask`, `taskId`, `httpRequest`, `httpResponse`.

---

## 3. Contribution & Change Lifecycle
1. Define shared contracts and Zod schemas in `@snake/types`.
2. Implement backend handlers in `services/`, `controllers/`, and `routes/`.
3. Add corresponding unit and integration tests.
4. Keep [`AGENTS.md`](../../AGENTS.md) and documentation in `docs/` updated.

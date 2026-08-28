# 🗄️ Database & Schema Design

The application utilizes **SQLite (`file:sqlite.db`)** paired with the type-safe **Kysely** query builder and the **LibSQL dialect (`@libsql/kysely-libsql`)**.

---

## Database Tables

### 1. `user` (User Accounts)
Stores user credentials, profile information, and RBAC roles.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `TEXT PRIMARY KEY` | Unique user identifier (UUID) |
| `name` | `TEXT NOT NULL` | Full name of the user |
| `email` | `TEXT UNIQUE NOT NULL` | User email address |
| `emailVerified` | `INTEGER NOT NULL DEFAULT 0` | Email verification flag (0 / 1) |
| `image` | `TEXT` | Avatar image URL |
| `role` | `TEXT NOT NULL DEFAULT 'user'` | Assigned role (`admin`, `user`, `guest`) |
| `createdAt` | `INTEGER / TEXT NOT NULL` | Creation timestamp |
| `updatedAt` | `INTEGER / TEXT NOT NULL` | Last update timestamp |

---

### 2. `session` (Authentication Sessions)
Managed by **Better Auth** to track active authentication tokens.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `TEXT PRIMARY KEY` | Session identifier |
| `token` | `TEXT UNIQUE NOT NULL` | Session cookie token |
| `expiresAt` | `INTEGER NOT NULL` | Expiration timestamp |
| `userId` | `TEXT NOT NULL` | Foreign key referencing `user.id` |

**Performance Indices**:
* `idx_session_userId` on `session(userId)` — Optimizes session validation queries.

---

### 3. `task` (User Dashboard Tasks)
Stores private tasks created by users.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `TEXT PRIMARY KEY` | Task UUID (`crypto.randomUUID()`) |
| `title` | `TEXT NOT NULL` | Task title |
| `description` | `TEXT NOT NULL DEFAULT ''` | Detailed task description |
| `completed` | `INTEGER NOT NULL DEFAULT 0` | Completion status (0 / 1) |
| `userId` | `TEXT NOT NULL` | Task owner foreign key referencing `user.id` |
| `createdAt` | `TEXT NOT NULL` | Creation ISO timestamp |

**Performance Indices**:
* `idx_task_userId` on `task(userId)` — Accelerates task lookups per user.

---

## Query Optimizations
* **Batch Inserts**: Initial default onboarding tasks are seeded using a single batch SQL insertion.
* **Database-Level Pagination**: `/api/admin/users` calculates `LIMIT`, `OFFSET`, and `COUNT(id)` directly within SQLite.

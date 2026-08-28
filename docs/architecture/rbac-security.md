# 🔐 Authentication & Role-Based Access Control (RBAC)

The application implements a robust **Role-Based Access Control (RBAC)** model powered by **Better Auth**.

---

## User Roles (`UserRole`)

Defined centrally in `@snake/types`:

* **`admin` (`UserRole.Admin`)**:
  * Unrestricted access to the Admin Dashboard (`/admin/users`).
  * Search, inspect, and paginate across all registered user accounts and sessions.
  * Manage tasks across the entire system.
* **`user` (`UserRole.User`)**:
  * Standard authenticated access.
  * Private task dashboard (`/`).
  * Restricted strictly to managing own tasks.
* **`guest` (`UserRole.Guest`)**:
  * Guest access mode with read-only/limited permissions.

---

## Security Best Practices & Configuration

1. **Environment Variables**: Administrative credentials and secret keys must always be configured through environment variables (e.g. `BETTER_AUTH_SECRET`) and never hardcoded in source control.
2. **Secret Management**: Keep `.env` files out of version control and manage production secrets using secure vaults or deployment environment settings.
3. **Session Invalidation**: Ensure session expiration (`session.expiresAt`) and cookie security flags (`httpOnly`, `secure`, `sameSite`) are enforced on HTTPS deployments.

---

## Route Protection (Express Middlewares)

Implemented in [`apps/api/src/middlewares/auth.middleware.ts`](file:///d:/WEB/SnakeMonorepo/apps/api/src/middlewares/auth.middleware.ts):

```typescript
// Requires an active session (any authenticated user)
export const requireAuth = async (request, response, next) => { ... }

// Requires Admin role (returns 403 Forbidden for non-admin users)
export const requireAdmin = async (request, response, next) => { ... }
```

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

---

## Server-Side Route Protection (Next.js SSR Guard)

To prevent unauthorized bundle exposure and layout flashing (Zero Layout Flash), routes such as `/admin/users` enforce RBAC directly on the server inside Next.js Server Components before HTML and JS are delivered to the browser.

### Implementation:
1. **Server Session Helper (`apps/web/src/lib/auth-server.ts`)**:
   - Uses Next.js `cookies()` and `headers()` to forward authentication headers to Express `GET /api/auth/get-session`.
   - Employs `cache: 'no-store'` to prevent caching user sessions across requests.
   - Enforces an `AbortSignal.timeout(5000)` safeguard to prevent SSR hanging on backend delays.
2. **Page Authorization (`apps/web/src/app/admin/users/page.tsx`)**:
   - Checks `getServerSession()`. If user is absent or `user.role !== UserRole.Admin`, returns the restricted UI or redirects directly on the server.
   - If authorized, passes the pre-verified user model (`initialUser={user}`) directly to `<AdminUsersContainer />`.
3. **Optimized Client Hydration**:
   - The client container skips waiting for `useSession()` to finish loading, immediately initializing table data without UI flicker.


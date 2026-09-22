import { createMiddleware } from 'hono/factory';
import { auth } from '../auth';
import { UserRole } from '@snake/types';

export type UserSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

export const requireAuth = createMiddleware<{ Variables: { userSession: UserSession } }>(
  async (c, next) => {
    try {
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });
      if (!session?.user) {
        return c.json({ message: 'Authentication required. Please sign in.' }, 401);
      }
      c.set('userSession', session);
      await next();
    } catch {
      return c.json({ message: 'Authentication required. Please sign in.' }, 401);
    }
  }
);

export const requireAdmin = createMiddleware<{ Variables: { userSession: UserSession } }>(
  async (c, next) => {
    try {
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });
      if (!session?.user) {
        return c.json({ message: 'Authentication required. Please sign in.' }, 401);
      }
      const userRole = (session.user as { role?: string }).role;
      if (userRole !== UserRole.Admin) {
        return c.json({ message: 'Forbidden. Admin access required.' }, 403);
      }
      c.set('userSession', session);
      await next();
    } catch {
      return c.json({ message: 'Authentication required. Please sign in.' }, 401);
    }
  }
);

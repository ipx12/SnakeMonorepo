import type { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth';
import { UserRole } from '@snake/types';

export interface AuthenticatedRequest extends Request {
  userSession?: NonNullable<Awaited<ReturnType<typeof getAuthSession>>>;
}

export const getAuthSession = async (httpRequest: Request) => {
  try {
    return await auth.api.getSession({
      headers: fromNodeHeaders(httpRequest.headers),
    });
  } catch {
    return null;
  }
};

export const requireAuth = async (
  httpRequest: AuthenticatedRequest,
  httpResponse: Response,
  nextMiddleware: NextFunction
) => {
  const session = await getAuthSession(httpRequest);
  if (!session?.user) {
    return httpResponse.status(401).json({ message: 'Authentication required. Please sign in.' });
  }
  httpRequest.userSession = session;
  nextMiddleware();
};

export const requireAdmin = async (
  httpRequest: AuthenticatedRequest,
  httpResponse: Response,
  nextMiddleware: NextFunction
) => {
  const session = await getAuthSession(httpRequest);
  if (!session?.user) {
    return httpResponse.status(401).json({ message: 'Authentication required. Please sign in.' });
  }
  const userRole = (session.user as { role?: string }).role;
  if (userRole !== UserRole.Admin) {
    return httpResponse.status(403).json({ message: 'Forbidden. Admin access required.' });
  }
  httpRequest.userSession = session;
  nextMiddleware();
};

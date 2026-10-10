import { createAuthClient } from 'better-auth/react';

/**
 * Base URL of the Better Auth endpoint (always the API/backend, not the frontend).
 * NEXT_PUBLIC_AUTH_URL overrides all; otherwise derived from NEXT_PUBLIC_API_URL
 * by stripping the trailing /api segment, falling back to localhost:3001.
 */
const authenticationBaseUrl =
  process.env.NEXT_PUBLIC_AUTH_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '')
    : 'http://localhost:3001');

export const authClient = createAuthClient({
  baseURL: authenticationBaseUrl,
});

export const { useSession, signIn, signUp, signOut } = authClient;

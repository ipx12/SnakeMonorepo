import { createAuthClient } from 'better-auth/react';

const authenticationBaseUrl =
  process.env.NEXT_PUBLIC_AUTH_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');

export const authClient = createAuthClient({
  baseURL: authenticationBaseUrl,
});

export const { useSession, signIn, signUp, signOut } = authClient;

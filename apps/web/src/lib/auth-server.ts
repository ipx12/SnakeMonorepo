import { cookies, headers } from 'next/headers';
import { type User } from '@snake/types';

/**
 * Server-side utility to securely fetch the current user's session 
 * from the Express API by forwarding the Next.js incoming cookies and headers.
 * This is used for Server-Side Route Protection.
 */
export async function getServerSession(): Promise<{ user: User | null; session: Record<string, unknown> | null }> {
  try {
    const nextCookies = await cookies();
    const nextHeaders = await headers();
    
    // We forward the cookie header, and also the host/origin if needed
    const fetchHeaders = new Headers();
    fetchHeaders.set('cookie', nextCookies.toString());
    
    // better-auth uses origin/host headers for CSRF protection in some cases
    const host = nextHeaders.get('host');
    if (host) fetchHeaders.set('host', host);
    
    const origin = nextHeaders.get('origin') || `http://${host}`;
    if (origin) fetchHeaders.set('origin', origin);
    
    const apiUrl = process.env.INTERNAL_API_URL
      ? `${process.env.INTERNAL_API_URL}/api`
      : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');
    
    // Call the better-auth backend get-session endpoint
    const response = await fetch(`${apiUrl}/auth/get-session`, {
      method: 'GET',
      headers: fetchHeaders,
      cache: 'no-store', // Important: don't cache session responses in Next.js Server Components
      signal: AbortSignal.timeout(5000), // 5 seconds timeout to protect SSR from hanging backends
    });
    
    if (!response.ok) {
      return { user: null, session: null };
    }
    
    const data = await response.json();
    if (!data) {
      return { user: null, session: null };
    }
    
    return { 
      user: data.user || null, 
      session: data.session || null 
    };
  } catch (error: unknown) {
    // Re-throw Next.js internal dynamic rendering errors (e.g. DYNAMIC_SERVER_USAGE)
    if (error && typeof error === 'object' && 'digest' in error && error.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error('[auth-server] Failed to fetch server session:', error);
    return { user: null, session: null };
  }
}

import { cookies, headers } from 'next/headers';
import { type User } from '@snake/types';
import { dispatchApiRequest } from '@/lib/api-fetch';

/**
 * Server-side utility to securely fetch the current user's session 
 * from the Express API by forwarding the Next.js incoming cookies and headers.
 * This is used for Server-Side Route Protection.
 */
export async function getServerSession(): Promise<{ user: User | null; session: Record<string, unknown> | null }> {
  try {
    const nextCookies = await cookies();
    const nextHeaders = await headers();
    
    // We forward the cookie header to authenticate the session
    const fetchHeaders = new Headers();
    const cookieHeader = nextCookies.toString();
    if (cookieHeader) {
      fetchHeaders.set('cookie', cookieHeader);
    }
    
    // Better Auth uses origin header for CSRF protection. Do NOT forward client Host header to avoid Cloudflare 404.
    const host = nextHeaders.get('host');
    const origin = nextHeaders.get('origin') || (host ? (host.includes('localhost') ? `http://${host}` : `https://${host}`) : '');
    if (origin) {
      fetchHeaders.set('origin', origin);
    }
    
    const baseApiUrl = process.env.INTERNAL_API_URL || 'http://localhost:3001';
    const apiUrl = `${baseApiUrl}/api`;
    
    // Explicitly set host header to target API host to satisfy Cloudflare edge routing
    fetchHeaders.set('host', new URL(apiUrl).host);
    
    // Call the better-auth backend get-session endpoint via Service Binding
    const response = await dispatchApiRequest(`${apiUrl}/auth/get-session`, {
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
    // Re-throw Next.js internal dynamic rendering and prerender errors (e.g. DYNAMIC_SERVER_USAGE, HANGING_PROMISE_REJECTION)
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    console.error('[auth-server] Failed to fetch server session:', error);
    return { user: null, session: null };
  }
}

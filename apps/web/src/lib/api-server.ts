import { cookies, headers } from 'next/headers';
import type { Task, AdminUsersResponse, AdminUsersQueryParams } from '@snake/types';
import { dispatchApiRequest } from '@/lib/api-fetch';

export interface ServerFetchOptions {
  signal?: AbortSignal;
}

/**
 * Server-side utility to securely fetch data from the Express API
 * by forwarding the Next.js incoming cookies and headers.
 * This is used for Server Components prefetching.
 */
export async function serverFetch<T>(endpoint: string, options: ServerFetchOptions = {}): Promise<T> {
  const nextCookies = await cookies();
  const nextHeaders = await headers();
  
  const fetchHeaders = new Headers();
  const cookieHeader = nextCookies.toString();
  if (cookieHeader) {
    fetchHeaders.set('cookie', cookieHeader);
  }
  
  // Set origin header for backend verification without breaking Cloudflare Host routing
  const host = nextHeaders.get('host');
  const origin = nextHeaders.get('origin') || (host ? (host.includes('localhost') ? `http://${host}` : `https://${host}`) : '');
  if (origin) {
    fetchHeaders.set('origin', origin);
  }
  
  const baseApiUrl = process.env.INTERNAL_API_URL || 'http://localhost:3001';
  const apiUrl = `${baseApiUrl}/api`;
  
  // Explicitly set host header to target API host to satisfy Cloudflare edge routing
  fetchHeaders.set('host', new URL(apiUrl).host);
  
  const timeoutSignal = AbortSignal.timeout(5000);
  const combinedSignal = options.signal
    ? AbortSignal.any([options.signal, timeoutSignal])
    : timeoutSignal;

  const response = await dispatchApiRequest(`${apiUrl}${endpoint}`, {
    method: 'GET',
    headers: fetchHeaders,
    cache: 'no-store',
    signal: combinedSignal,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Server fetch failed: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getTasksServer(options?: ServerFetchOptions): Promise<Task[]> {
  return serverFetch<Task[]>('/tasks', options);
}

export async function getAdminUsersServer(
  queryParams?: AdminUsersQueryParams,
  options?: ServerFetchOptions
): Promise<AdminUsersResponse> {
  const urlSearchParams = new URLSearchParams();
  if (queryParams?.page !== undefined) urlSearchParams.set('page', String(queryParams.page));
  if (queryParams?.limit !== undefined) urlSearchParams.set('limit', String(queryParams.limit));
  if (queryParams?.search) urlSearchParams.set('search', queryParams.search);

  const queryString = urlSearchParams.toString();
  const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
  
  return serverFetch<AdminUsersResponse>(endpoint, options);
}

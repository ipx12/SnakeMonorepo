import { cookies, headers } from 'next/headers';
import type { Task, AdminUsersResponse, AdminUsersQueryParams } from '@snake/types';

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
  fetchHeaders.set('cookie', nextCookies.toString());
  
  const host = nextHeaders.get('host');
  if (host) fetchHeaders.set('host', host);
  
  const origin = nextHeaders.get('origin') || (host ? `http://${host}` : '');
  if (origin) fetchHeaders.set('origin', origin);
  
  const apiUrl = process.env.INTERNAL_API_URL
    ? `${process.env.INTERNAL_API_URL}/api`
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');
  
  const timeoutSignal = AbortSignal.timeout(5000);
  const combinedSignal = options.signal
    ? AbortSignal.any([options.signal, timeoutSignal])
    : timeoutSignal;

  const response = await fetch(`${apiUrl}${endpoint}`, {
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

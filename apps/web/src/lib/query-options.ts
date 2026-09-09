import { queryOptions } from '@tanstack/react-query';
import { taskKeys, adminUserKeys, type AdminUsersQueryParams } from '@snake/types';
import { getTasks, getAdminUsers } from '@/lib/api';

/**
 * Type-safe query options for task list queries.
 * Automatically ties the queryKey with queryFn and supports AbortSignal.
 */
export const tasksQueryOptions = queryOptions({
  queryKey: taskKeys.all,
  queryFn: ({ signal }) => getTasks(signal),
});

/**
 * Type-safe query options for admin user list queries.
 * Dynamically binds pagination and search parameters.
 */
export const adminUsersQueryOptions = (queryParams: AdminUsersQueryParams) =>
  queryOptions({
    queryKey: adminUserKeys.list(queryParams),
    queryFn: ({ signal }) => getAdminUsers(queryParams, signal),
  });

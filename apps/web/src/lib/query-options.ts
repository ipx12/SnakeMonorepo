import { queryOptions } from '@tanstack/react-query';
import { taskKeys, adminUserKeys, type AdminUsersQueryParams } from '@snake/types';
import { getTasks, getTaskById, getAdminUsers } from '@/lib/api';

/**
 * Type-safe query options for task list queries.
 * Automatically ties the queryKey with queryFn and supports AbortSignal.
 */
export const tasksQueryOptions = queryOptions({
  queryKey: taskKeys.all,
  queryFn: ({ signal }) => getTasks(signal),
});

/**
 * Type-safe query options for a single task detail query.
 * Automatically binds the task ID to `taskKeys.detail(taskId)` and supports AbortSignal.
 *
 * @param taskId - Unique identifier of the task to query
 * @returns Configured TanStack Query options for the task detail
 */
export const taskDetailQueryOptions = (taskId: string) =>
  queryOptions({
    queryKey: taskKeys.detail(taskId),
    queryFn: ({ signal }) => getTaskById(taskId, signal),
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

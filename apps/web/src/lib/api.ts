import {
  UserRole,
  type User,
  type AuthResponse,
  type RegisterPayload,
  type LoginPayload,
  type Task,
  type AdminUserDetail,
  type PaginationMeta,
  type AdminUsersResponse,
  type AdminUsersQueryParams,
} from '@snake/types';

export {
  UserRole,
  type User,
  type AuthResponse,
  type RegisterPayload,
  type LoginPayload,
  type Task,
  type AdminUserDetail,
  type PaginationMeta,
  type AdminUsersResponse,
  type AdminUsersQueryParams,
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const TASKS_API_URL = `${BASE_URL}/tasks`;

/**
 * Fetches all tasks belonging to the currently authenticated user.
 *
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Array of Task items owned by the authenticated user
 * @throws {Error} If authentication session is missing or server returns non-200
 */
export async function getTasks(signal?: AbortSignal): Promise<Task[]> {
  const apiResponse = await fetch(TASKS_API_URL, { credentials: 'include', signal });
  if (!apiResponse.ok) throw new Error('Failed to fetch tasks');
  return apiResponse.json();
}

/**
 * Creates and persists a new task for the authenticated user.
 *
 * @param title - Task title (must not be empty)
 * @param description - Detailed description or notes for the task
 * @returns The newly created Task object with assigned id and timestamp
 * @throws {Error} If title is empty or creation fails on the server
 */
export async function createTask(title: string, description: string): Promise<Task> {
  const apiResponse = await fetch(TASKS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
    credentials: 'include',
  });
  if (!apiResponse.ok) throw new Error('Failed to create task');
  return apiResponse.json();
}

/**
 * Updates an existing task by its ID.
 *
 * @param taskId - Unique identifier of the task to update
 * @param updates - Partial fields to update (`title`, `description`, `completed`)
 * @returns The updated Task entity
 * @throws {Error} If task does not exist, belongs to another user (403), or update fails
 */
export async function updateTask(
  taskId: string,
  updates: Partial<Omit<Task, 'id' | 'createdAt'>>
): Promise<Task> {
  const apiResponse = await fetch(`${TASKS_API_URL}/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
    credentials: 'include',
  });
  if (!apiResponse.ok) throw new Error('Failed to update task');
  return apiResponse.json();
}

/**
 * Permanently deletes a task by ID.
 *
 * @param taskId - Unique identifier of the task to delete
 * @throws {Error} If user does not own the task or deletion fails
 */
export async function deleteTask(taskId: string): Promise<void> {
  const apiResponse = await fetch(`${TASKS_API_URL}/${taskId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!apiResponse.ok) throw new Error('Failed to delete task');
}

/**
 * Fetches paginated user records with search filtering for Admin users.
 *
 * @param queryParams - Pagination parameters (`page`, `limit`) and search query string
 * @param signal - Optional AbortSignal for query cancellation
 * @returns Paginated list of users accompanied by total count metadata
 * @throws {Error} If user is unauthenticated (401) or lacks the Admin role (403)
 *
 * @example
 * const { users, pagination } = await getAdminUsers({ page: 1, limit: 10, search: 'alex' });
 */
export async function getAdminUsers(
  queryParams?: AdminUsersQueryParams,
  signal?: AbortSignal
): Promise<AdminUsersResponse> {
  const urlSearchParams = new URLSearchParams();
  if (queryParams?.page !== undefined) urlSearchParams.set('page', String(queryParams.page));
  if (queryParams?.limit !== undefined) urlSearchParams.set('limit', String(queryParams.limit));
  if (queryParams?.search) urlSearchParams.set('search', queryParams.search);

  const queryString = urlSearchParams.toString();
  const requestUrl = queryString ? `${BASE_URL}/admin/users?${queryString}` : `${BASE_URL}/admin/users`;

  const apiResponse = await fetch(requestUrl, { credentials: 'include', signal });
  if (!apiResponse.ok) {
    const errorResponseData = await apiResponse.json().catch(() => ({}));
    throw new Error(errorResponseData.message || 'Failed to fetch users list');
  }
  return apiResponse.json();
}

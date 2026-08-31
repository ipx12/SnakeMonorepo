import {
  UserRole,
  type User,
  type AuthResponse,
  type RegisterPayload,
  type LoginPayload,
  type Task,
  type Item,
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
  type Item,
  type AdminUserDetail,
  type PaginationMeta,
  type AdminUsersResponse,
  type AdminUsersQueryParams,
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const TASKS_API_URL = `${BASE_URL}/tasks`;

// Tasks API calls
export async function getTasks(): Promise<Task[]> {
  const apiResponse = await fetch(TASKS_API_URL, { credentials: 'include' });
  if (!apiResponse.ok) throw new Error('Failed to fetch tasks');
  return apiResponse.json();
}


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


export async function updateTask(taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task> {
  const apiResponse = await fetch(`${TASKS_API_URL}/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
    credentials: 'include',
  });
  if (!apiResponse.ok) throw new Error('Failed to update task');
  return apiResponse.json();
}


export async function deleteTask(taskId: string): Promise<void> {
  const apiResponse = await fetch(`${TASKS_API_URL}/${taskId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!apiResponse.ok) throw new Error('Failed to delete task');
}


export async function getAdminUsers(queryParams?: AdminUsersQueryParams): Promise<AdminUsersResponse> {
  const urlSearchParams = new URLSearchParams();
  if (queryParams?.page !== undefined) urlSearchParams.set('page', String(queryParams.page));
  if (queryParams?.limit !== undefined) urlSearchParams.set('limit', String(queryParams.limit));
  if (queryParams?.search) urlSearchParams.set('search', queryParams.search);

  const queryString = urlSearchParams.toString();
  const requestUrl = queryString ? `${BASE_URL}/admin/users?${queryString}` : `${BASE_URL}/admin/users`;

  const apiResponse = await fetch(requestUrl, { credentials: 'include' });
  if (!apiResponse.ok) {
    const errorResponseData = await apiResponse.json().catch(() => ({}));
    throw new Error(errorResponseData.message || 'Failed to fetch users list');
  }
  return apiResponse.json();
}


import {
  UserRole,
  type User,
  type AuthResponse,
  type RegisterPayload,
  type LoginPayload,
  type Task,
  type Item,
  type AdminUserDetail,
} from '@snake/types';
import { authClient } from './auth-client';

export { UserRole, type User, type AuthResponse, type RegisterPayload, type LoginPayload, type Task, type Item, type AdminUserDetail };

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const TASKS_API_URL = `${BASE_URL}/tasks`;

// Authentication API calls via Better Auth
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const { data, error } = await authClient.signUp.email({
    email: payload.email,
    password: payload.password,
    name: payload.name,
    role: payload.role || UserRole.User,
  } as Parameters<typeof authClient.signUp.email>[0]);

  if (error || !data?.user) {
    throw new Error(error?.message || 'Failed to register account');
  }

  const user: User = {
    id: data.user.id,
    name: data.user.name || '',
    email: data.user.email,
    role: (data.user as { role?: UserRole }).role || payload.role || UserRole.User,
    createdAt: data.user.createdAt ? data.user.createdAt.toString() : new Date().toISOString(),
  };

  return { user };
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const { data, error } = await authClient.signIn.email({
    email: payload.email,
    password: payload.password,
  });

  if (error || !data?.user) {
    throw new Error(error?.message || 'Failed to login');
  }

  const user: User = {
    id: data.user.id,
    name: data.user.name || '',
    email: data.user.email,
    role: (data.user as { role?: UserRole }).role || UserRole.User,
    createdAt: data.user.createdAt ? data.user.createdAt.toString() : new Date().toISOString(),
  };

  return { user };
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await authClient.getSession();
    if (!data?.user) return null;

    return {
      id: data.user.id,
      name: data.user.name || '',
      email: data.user.email,
      role: (data.user as { role?: UserRole }).role || UserRole.User,
      createdAt: data.user.createdAt ? data.user.createdAt.toString() : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await authClient.signOut();
  } catch {
    // Ignore network errors during logout
  }
}

// Tasks API calls
export async function getTasks(): Promise<Task[]> {
  const apiResponse = await fetch(TASKS_API_URL, { credentials: 'include' });
  if (!apiResponse.ok) throw new Error('Failed to fetch tasks');
  return apiResponse.json();
}

export const getItems = getTasks;

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

export const createItem = createTask;

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

export const updateItem = updateTask;

export async function deleteTask(taskId: string): Promise<void> {
  const apiResponse = await fetch(`${TASKS_API_URL}/${taskId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!apiResponse.ok) throw new Error('Failed to delete task');
}

export const deleteItem = deleteTask;

export async function getAdminUsers(): Promise<AdminUserDetail[]> {
  const apiResponse = await fetch(`${BASE_URL}/admin/users`, { credentials: 'include' });
  if (!apiResponse.ok) {
    const errorResponseData = await apiResponse.json().catch(() => ({}));
    throw new Error(errorResponseData.message || 'Failed to fetch users list');
  }
  return apiResponse.json();
}


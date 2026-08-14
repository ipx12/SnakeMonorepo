import { authClient } from './auth-client';
import { UserRole } from './roles';
export { UserRole };

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  token?: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  userId?: string;
  createdAt: string;
}

const BASE_URL = 'http://localhost:3001/api';
const API_URL = `${BASE_URL}/items`;

// Authentication API calls via Better Auth
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const { data, error } = await authClient.signUp.email({
    email: payload.email,
    password: payload.password,
    name: payload.name,
    role: payload.role || UserRole.User,
  } as any);

  if (error || !data?.user) {
    throw new Error(error?.message || 'Failed to register account');
  }

  const user: User = {
    id: data.user.id,
    name: data.user.name || '',
    email: data.user.email,
    role: (data.user as any).role || payload.role || UserRole.User,
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
    role: (data.user as any).role || UserRole.User,
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
      role: (data.user as any).role || UserRole.User,
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

// Items API calls
export async function getItems(): Promise<Item[]> {
  const apiResponse = await fetch(API_URL, { credentials: 'include' });
  if (!apiResponse.ok) throw new Error('Failed to fetch items');
  return apiResponse.json();
}

export async function createItem(title: string, description: string): Promise<Item> {
  const apiResponse = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
    credentials: 'include',
  });
  if (!apiResponse.ok) throw new Error('Failed to create item');
  return apiResponse.json();
}

export async function updateItem(itemId: string, updates: Partial<Omit<Item, 'id' | 'createdAt'>>): Promise<Item> {
  const apiResponse = await fetch(`${API_URL}/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
    credentials: 'include',
  });
  if (!apiResponse.ok) throw new Error('Failed to update item');
  return apiResponse.json();
}

export async function deleteItem(itemId: string): Promise<void> {
  const apiResponse = await fetch(`${API_URL}/${itemId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!apiResponse.ok) throw new Error('Failed to delete item');
}

export interface AdminUserDetail {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export async function getAdminUsers(): Promise<AdminUserDetail[]> {
  const apiResponse = await fetch(`${BASE_URL}/admin/users`, { credentials: 'include' });
  if (!apiResponse.ok) {
    const errorResponseData = await apiResponse.json().catch(() => ({}));
    throw new Error(errorResponseData.message || 'Failed to fetch users list');
  }
  return apiResponse.json();
}


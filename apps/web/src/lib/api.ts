import { authClient } from './auth-client';

export type UserRole = 'admin' | 'user' | 'guest';

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
    role: payload.role || 'user',
  } as any);

  if (error || !data?.user) {
    throw new Error(error?.message || 'Failed to register account');
  }

  const user: User = {
    id: data.user.id,
    name: data.user.name || '',
    email: data.user.email,
    role: (data.user as any).role || payload.role || 'user',
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
    role: (data.user as any).role || 'user',
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
      role: (data.user as any).role || 'user',
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
  const res = await fetch(API_URL, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch items');
  return res.json();
}

export async function createItem(title: string, description: string): Promise<Item> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to create item');
  return res.json();
}

export async function updateItem(id: string, updates: Partial<Omit<Item, 'id' | 'createdAt'>>): Promise<Item> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to update item');
  return res.json();
}

export async function deleteItem(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete item');
}

/**
 * Enum of all user roles in the application.
 */
export enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
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

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  userId?: string;
  createdAt: string;
}

// Backward compatibility alias for Item
export type Item = Task;

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

export interface CreateTaskPayload {
  title: string;
  description?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  completed?: boolean;
}

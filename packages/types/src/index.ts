import { z } from 'zod';

/**
 * Enum of all user roles in the application.
 */
export enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

// ---------------------------------------------------------------------------
// Auth Schemas & Types
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type LoginPayload = LoginFormData;

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Confirm password is required'),
    role: z.nativeEnum(UserRole),
  })
  .refine((formData) => formData.password === formData.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
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

export interface AuthResponse {
  token?: string;
  user: User;
}

// ---------------------------------------------------------------------------
// Task Schemas & Types
// ---------------------------------------------------------------------------

export const createTaskSchema = z.object({
  title: z
    .string({ error: 'Title is required' })
    .min(1, 'Title is required')
    .trim(),
  description: z.string().optional().default(''),
});

export type CreateTaskPayload = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').trim().optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
});

export type UpdateTaskPayload = z.infer<typeof updateTaskSchema>;

export const taskIdParamSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
});

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

// ---------------------------------------------------------------------------
// Pagination & Admin Query Schemas
// ---------------------------------------------------------------------------

export const adminUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional().default(''),
});

export type AdminUsersQueryParams = z.infer<typeof adminUsersQuerySchema>;

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface AdminUsersResponse {
  users: AdminUserDetail[];
  pagination: PaginationMeta;
}

// ---------------------------------------------------------------------------
// Database Schema Types (Kysely)
// ---------------------------------------------------------------------------

export interface UserTable {
  id: string;
  name: string;
  email: string;
  emailVerified: number;
  image: string | null;
  role: string;
  createdAt: number;
  updatedAt: number;
}

export interface SessionTable {
  id: string;
  expiresAt: number;
  token: string;
  createdAt: number;
  updatedAt: number;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
}

export interface AccountTable {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  accessTokenExpiresAt: number | null;
  refreshTokenExpiresAt: number | null;
  scope: string | null;
  password: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface VerificationTable {
  id: string;
  identifier: string;
  value: string;
  expiresAt: number;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface TaskTable {
  id: string;
  title: string;
  description: string | null;
  completed: number;
  userId: string;
  createdAt: string;
}

export interface DatabaseSchema {
  user: UserTable;
  session: SessionTable;
  account: AccountTable;
  verification: VerificationTable;
  task: TaskTable;
}

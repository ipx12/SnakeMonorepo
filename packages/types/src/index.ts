import { z } from 'zod';

/**
 * User roles in the application.
 */
export const UserRole = {
  Admin: 'admin',
  User: 'user',
  Guest: 'guest',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ---------------------------------------------------------------------------
// Auth Schemas & Types
// ---------------------------------------------------------------------------

/**
 * Schema validating user credentials for login requests.
 */
export const loginSchema = z.object({
  /** User's registered email address */
  email: z.string().email('Please enter a valid email address'),
  /** User's account password (minimum 6 characters) */
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type LoginPayload = LoginFormData;

/**
 * Schema validating new user account creation, including confirmation password matching.
 */
export const registerSchema = z
  .object({
    /** User's full display name */
    name: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Name must be at least 2 characters'),
    /** Unique email address */
    email: z.string().email('Please enter a valid email address'),
    /** Account password (minimum 6 characters) */
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
    /** Password confirmation matching the password field */
    confirmPassword: z
      .string()
      .min(1, 'Confirm password is required'),
    /** Assigned access role in the system */
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

/**
 * Schema validating task creation request bodies.
 */
export const createTaskSchema = z.object({
  /** Required task title */
  title: z
    .string({ error: 'Title is required' })
    .min(1, 'Title is required')
    .trim(),
  /** Optional markdown or plain text notes */
  description: z.string().optional().default(''),
});

export type CreateTaskPayload = z.infer<typeof createTaskSchema>;

/**
 * Schema validating partial updates to an existing task.
 */
export const updateTaskSchema = z.object({
  /** Updated title (non-empty if provided) */
  title: z.string().min(1, 'Title cannot be empty').trim().optional(),
  /** Updated notes or description */
  description: z.string().optional(),
  /** Updated task completion status */
  completed: z.boolean().optional(),
});

export type UpdateTaskPayload = z.infer<typeof updateTaskSchema>;

/**
 * Schema validating URL route parameters containing a task ID.
 */
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

/**
 * Schema validating query string parameters for the admin users list endpoint.
 */
export const adminUsersQuerySchema = z.object({
  /** Page number, 1-indexed (defaults to 1) */
  page: z.coerce.number().int().positive().default(1),
  /** Records per page limit, between 1 and 100 (defaults to 10) */
  limit: z.coerce.number().int().positive().max(100).default(10),
  /** Substring search filter across name, email, role, or ID */
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

// ---------------------------------------------------------------------------
// Query Keys (TanStack Query / Cache Keys)
// ---------------------------------------------------------------------------

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (taskId: string) => [...taskKeys.details(), taskId] as const,
};

export const adminUserKeys = {
  all: ['adminUsers'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (queryParams: AdminUsersQueryParams) => [...adminUserKeys.all, queryParams] as const,
};


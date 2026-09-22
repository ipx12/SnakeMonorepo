import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserRole } from '@snake/types';

// Mock Next.js navigation and auth client context before importing components
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('@/lib/auth-client', () => ({
  useSession: vi.fn().mockReturnValue({ data: null, isPending: false }),
  signIn: { email: vi.fn() },
  signUp: { email: vi.fn() },
  signOut: vi.fn(),
}));

// We'll mock this individually per test
const mockGetServerSession = vi.fn();
vi.mock('@/lib/auth-server', () => ({
  getServerSession: () => mockGetServerSession(),
}));

// Mock API server calls that happen during SSR prefetching
vi.mock('@/lib/api-server', () => ({
  getTasksServer: vi.fn().mockResolvedValue([]),
  getAdminUsersServer: vi.fn().mockResolvedValue({ users: [], pagination: { totalCount: 0, page: 1, limit: 10, totalPages: 1 } }),
}));

// Mock client API calls
vi.mock('@/lib/api', () => ({
  getTasks: vi.fn().mockResolvedValue([]),
  getAdminUsers: vi.fn().mockResolvedValue({ users: [], pagination: { totalCount: 0, page: 1, limit: 10, totalPages: 1 } }),
}));

import HomePage from '../app/page';
import LoginPage from '../app/login/page';
import RegisterPage from '../app/register/page';
import AdminUsersPage from '../app/admin/users/page';
import { useSession } from '@/lib/auth-client';

function renderWithProviders(ui: React.ReactElement) {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(<QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>);
}

describe('App Router Pages Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: null, session: null });
    (useSession as any).mockReturnValue({ data: null, isPending: false });
  });

  describe('Unauthenticated State', () => {
    it('HomePage should show login prompt', async () => {
      const Component = await HomePage();
      renderWithProviders(Component);
      expect(await screen.findByText('Please Sign In')).toBeInTheDocument();
    });

    it('AdminUsersPage should show Access Denied', async () => {
      const Component = await AdminUsersPage();
      renderWithProviders(Component);
      expect(await screen.findByText(/Access Restricted/i)).toBeInTheDocument();
    });
  });

  describe('Authenticated Standard User State', () => {
    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'user@watermelon.ui',
      role: UserRole.User,
    };

    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({ user: mockUser, session: { id: 'sess-1' } });
      (useSession as any).mockReturnValue({ data: { user: mockUser }, isPending: false });
    });

    it('HomePage should render Dashboard and task creation form', async () => {
      const Component = await HomePage();
      renderWithProviders(Component);
      // Wait for client to hydrate and render dashboard elements
      await waitFor(() => {
        expect(screen.getByText('Create New Task')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
      });
    });

    it('AdminUsersPage should show Access Denied for standard user', async () => {
      const Component = await AdminUsersPage();
      renderWithProviders(Component);
      expect(await screen.findByText(/Access Restricted/i)).toBeInTheDocument();
    });
  });

  describe('Authenticated Admin State', () => {
    const mockAdmin = {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@watermelon.ui',
      role: UserRole.Admin,
    };

    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({ user: mockAdmin, session: { id: 'sess-2' } });
      (useSession as any).mockReturnValue({ data: { user: mockAdmin }, isPending: false });
    });

    it('AdminUsersPage should render Admin Users Table and Stats', async () => {
      const Component = await AdminUsersPage();
      renderWithProviders(Component);
      
      await waitFor(() => {
        // Look for typical admin page elements
        expect(screen.getByText('Total Registered')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Search by name/i)).toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
    });
  });

  describe('Auth Pages', () => {
    it('should render the Login page component without crashing', () => {
      renderWithProviders(<LoginPage />);
      expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
    });

    it('should render the Register page component without crashing', () => {
      renderWithProviders(<RegisterPage />);
      expect(screen.getByRole('heading', { name: /Create New Account/i })).toBeInTheDocument();
    });
  });
});

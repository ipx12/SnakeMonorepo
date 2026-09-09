import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { AdminUsersContainer } from '../components/admin/AdminUsersContainer';
import * as apiModule from '../lib/api';
import { UserRole } from '@snake/types';
import type { AdminUsersResponse } from '@snake/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('../lib/auth-client', () => ({
  useSession: () => ({
    data: null,
    isPending: false,
  }),
}));

vi.mock('../lib/api', () => ({
  getAdminUsers: vi.fn(),
}));

function renderWithTestProviders(ui: React.ReactElement) {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });

  return render(<QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>);
}

describe('AdminUsersContainer Component Integration Tests', () => {
  const mockAdminUser = {
    id: 'admin-main-1',
    name: 'Super Administrator',
    email: 'admin@watermelon.ui',
    role: UserRole.Admin,
  };

  const mockRegularUser = {
    id: 'user-regular-2',
    name: 'Standard User',
    email: 'standard@watermelon.ui',
    role: UserRole.User,
  };

  const mockUsersResponse: AdminUsersResponse = {
    users: [
      {
        id: 'user-admin-1',
        name: 'Alice Administrator',
        email: 'alice.admin@watermelon.ui',
        role: UserRole.Admin,
        createdAt: '2026-01-15T08:30:00.000Z',
        updatedAt: '2026-01-15T08:30:00.000Z',
      },
      {
        id: 'user-dev-2',
        name: 'Bob Developer',
        email: 'bob.dev@watermelon.ui',
        role: UserRole.User,
        createdAt: '2026-02-10T14:15:00.000Z',
        updatedAt: '2026-02-10T14:15:00.000Z',
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      totalCount: 2,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Access Restricted view when user has regular role', () => {
    renderWithTestProviders(<AdminUsersContainer initialUser={mockRegularUser} />);

    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(
      screen.getByText(/The admin panel is only accessible to users with the/i)
    ).toBeInTheDocument();
  });

  it('should render admin dashboard header and metrics cards for authorized admin', async () => {
    vi.mocked(apiModule.getAdminUsers).mockResolvedValueOnce(mockUsersResponse);

    renderWithTestProviders(<AdminUsersContainer initialUser={mockAdminUser} />);

    expect(screen.getByRole('heading', { name: /All System Users/i })).toBeInTheDocument();
    expect(screen.getByText('Total Registered')).toBeInTheDocument();
    expect(screen.getByText('Admins on Page')).toBeInTheDocument();
    expect(screen.getByText('Users on Page')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Alice Administrator')).toBeInTheDocument();
    });
  });

  it('should render users table rows with correct email, name and badges', async () => {
    vi.mocked(apiModule.getAdminUsers).mockResolvedValueOnce(mockUsersResponse);

    renderWithTestProviders(<AdminUsersContainer initialUser={mockAdminUser} />);

    await waitFor(() => {
      expect(screen.getByText('Alice Administrator')).toBeInTheDocument();
      expect(screen.getByText('alice.admin@watermelon.ui')).toBeInTheDocument();
      expect(screen.getByText('Bob Developer')).toBeInTheDocument();
      expect(screen.getByText('bob.dev@watermelon.ui')).toBeInTheDocument();
    });
  });

  it('should display empty message when no users are returned', async () => {
    const emptyResponse: AdminUsersResponse = {
      users: [],
      pagination: {
        page: 1,
        limit: 10,
        totalCount: 0,
        totalPages: 1,
      },
    };
    vi.mocked(apiModule.getAdminUsers).mockResolvedValueOnce(emptyResponse);

    renderWithTestProviders(<AdminUsersContainer initialUser={mockAdminUser} />);

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  it('should allow filtering users via search input', async () => {
    vi.mocked(apiModule.getAdminUsers).mockResolvedValue(mockUsersResponse);

    renderWithTestProviders(<AdminUsersContainer initialUser={mockAdminUser} />);

    const searchInputElement = screen.getByPlaceholderText(
      'Search by name, email, ID or role...'
    );
    expect(searchInputElement).toBeInTheDocument();

    await userEvent.type(searchInputElement, 'alice');
    expect(searchInputElement).toHaveValue('alice');
  });

  it('should handle pagination controls and page navigation', async () => {
    const multiPageResponse: AdminUsersResponse = {
      users: mockUsersResponse.users,
      pagination: {
        page: 1,
        limit: 2,
        totalCount: 15,
        totalPages: 8,
      },
    };
    vi.mocked(apiModule.getAdminUsers).mockResolvedValue(multiPageResponse);

    renderWithTestProviders(<AdminUsersContainer initialUser={mockAdminUser} />);

    await waitFor(() => {
      expect(screen.getByText('Alice Administrator')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /Next/i });
    const previousButton = screen.getByRole('button', { name: /Previous/i });

    // On page 1, Previous button should be disabled
    expect(previousButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    // Click Next button
    await userEvent.click(nextButton);

    // Verify page number updated in DOM
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

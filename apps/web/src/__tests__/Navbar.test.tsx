import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from '../components/Navbar';
import { useSession, signOut } from '@/lib/auth-client';
import { UserRole } from '@snake/types';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('@/lib/auth-client', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

function renderNavbarWithQueryClient() {
  const testQueryClient = new QueryClient();
  const clearQueryCacheSpy = vi.spyOn(testQueryClient, 'clear');

  const renderResult = render(
    <QueryClientProvider client={testQueryClient}>
      <Navbar />
    </QueryClientProvider>
  );

  return { ...renderResult, testQueryClient, clearQueryCacheSpy };
}

describe('Navbar Component Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render brand logo, title, and dashboard link', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      isPending: false,
    } as unknown as ReturnType<typeof useSession>);

    renderNavbarWithQueryClient();

    expect(screen.getByText('Watermelon')).toBeInTheDocument();
    expect(screen.getByTitle('Dashboard')).toBeInTheDocument();
  });

  it('should render Login and Register buttons for unauthenticated guest', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      isPending: false,
    } as unknown as ReturnType<typeof useSession>);

    renderNavbarWithQueryClient();

    expect(screen.getByTitle('Login')).toBeInTheDocument();
    expect(screen.getByTitle('Register')).toBeInTheDocument();
    expect(screen.queryByTitle('Users')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Sign Out')).not.toBeInTheDocument();
  });

  it('should render user profile and logout button for regular authenticated user, without admin link', () => {
    const regularUserSession = {
      user: {
        id: 'user-regular-1',
        name: 'Regular Developer',
        email: 'developer@watermelon.ui',
        role: UserRole.User,
      },
    };

    vi.mocked(useSession).mockReturnValue({
      data: regularUserSession,
      isPending: false,
    } as unknown as ReturnType<typeof useSession>);

    renderNavbarWithQueryClient();

    expect(screen.getByText('Regular Developer')).toBeInTheDocument();
    expect(screen.getByText('developer@watermelon.ui')).toBeInTheDocument();
    expect(screen.getByTitle('Sign Out')).toBeInTheDocument();
    // Normal user must NOT see the Users (Admin) link
    expect(screen.queryByTitle('Users')).not.toBeInTheDocument();
  });

  it('should render Admin Users navigation link for user with Admin role', () => {
    const adminUserSession = {
      user: {
        id: 'admin-user-1',
        name: 'Platform Admin',
        email: 'admin@watermelon.ui',
        role: UserRole.Admin,
      },
    };

    vi.mocked(useSession).mockReturnValue({
      data: adminUserSession,
      isPending: false,
    } as unknown as ReturnType<typeof useSession>);

    renderNavbarWithQueryClient();

    expect(screen.getByTitle('Users')).toBeInTheDocument();
    expect(screen.getByText('Platform Admin')).toBeInTheDocument();
  });

  it('should invoke authClient.signOut and clear React Query cache on logout click', async () => {
    const loggedInUserSession = {
      user: {
        id: 'user-logout-test',
        name: 'Logout Tester',
        email: 'logout@watermelon.ui',
        role: UserRole.User,
      },
    };

    vi.mocked(useSession).mockReturnValue({
      data: loggedInUserSession,
      isPending: false,
    } as unknown as ReturnType<typeof useSession>);

    const { clearQueryCacheSpy } = renderNavbarWithQueryClient();

    const logoutButton = screen.getByTitle('Sign Out');
    await userEvent.click(logoutButton);

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(clearQueryCacheSpy).toHaveBeenCalledTimes(1);
  });
});

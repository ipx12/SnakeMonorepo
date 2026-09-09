import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock Next.js navigation and auth context before importing components
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('@/lib/auth-client', () => ({
  useSession: () => ({
    data: null,
    isPending: false,
  }),
  signIn: { email: vi.fn() },
  signUp: { email: vi.fn() },
  signOut: vi.fn(),
}));

vi.mock('@/lib/auth-server', () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: null, session: null }),
}));

import HomePage from '../app/page';
import LoginPage from '../app/login/page';
import RegisterPage from '../app/register/page';
import AdminUsersPage from '../app/admin/users/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

describe('App Router Pages Routing', () => {
  it('should render the Home page component without crashing', async () => {
    const Component = await HomePage();
    renderWithProviders(Component);
    expect(await screen.findByText('Please Sign In')).toBeInTheDocument();
  });

  it('should render the Login page component without crashing', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
  });

  it('should render the Register page component without crashing', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByRole('heading', { name: /Create New Account/i })).toBeInTheDocument();
  });

  it('should render the Admin Users page component without crashing', async () => {
    const Component = await AdminUsersPage();
    renderWithProviders(Component);
    expect(await screen.findByText(/Access Restricted/i)).toBeInTheDocument();
  });
});




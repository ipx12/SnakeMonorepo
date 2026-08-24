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

vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import HomePage from '../app/page';
import LoginPage from '../app/login/page';
import RegisterPage from '../app/register/page';
import AdminUsersPage from '../app/admin/users/page';

describe('App Router Pages Routing', () => {
  it('should render the Home page component without crashing', () => {
    render(<HomePage />);
    expect(screen.getByText('Please Sign In')).toBeInTheDocument();
  });

  it('should render the Login page component without crashing', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
  });

  it('should render the Register page component without crashing', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('heading', { name: /Create New Account/i })).toBeInTheDocument();
  });

  it('should render the Admin Users page component without crashing', async () => {
    render(<AdminUsersPage />);
    expect(await screen.findByText(/Access Restricted/i)).toBeInTheDocument();
  });
});




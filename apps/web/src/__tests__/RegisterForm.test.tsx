import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { RegisterForm } from '../components/auth/RegisterForm';
import { signUp } from '@/lib/auth-client';
import { UserRole } from '@snake/types';

const mockRouterPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

vi.mock('@/lib/auth-client', () => ({
  signUp: {
    email: vi.fn(),
  },
}));

describe('RegisterForm Component Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render registration form elements properly', () => {
    render(<RegisterForm />);

    expect(screen.getByRole('heading', { name: /Create New Account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
    expect(screen.getByRole('button', { name: /Register Account/i })).toBeInTheDocument();
  });

  it('should show error when passwords do not match', async () => {
    render(<RegisterForm />);

    const nameInput = screen.getByPlaceholderText('John Doe');
    const emailInput = screen.getByPlaceholderText('name@example.com');
    const [passwordInput, confirmPasswordInput] = screen.getAllByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Register Account/i });

    await userEvent.type(nameInput, 'Alex User');
    await userEvent.type(emailInput, 'alex@watermelon.ui');
    await userEvent.type(passwordInput, 'securepassword123');
    await userEvent.type(confirmPasswordInput, 'differentpassword456');
    await userEvent.click(submitButton);

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(signUp.email).not.toHaveBeenCalled();
  });

  it('should register successfully and redirect to / on valid credentials', async () => {
    vi.mocked(signUp.email).mockResolvedValueOnce({
      data: { user: { id: 'registered-user-id' } },
      error: null,
    } as unknown as Awaited<ReturnType<typeof signUp.email>>);

    render(<RegisterForm />);

    const nameInput = screen.getByPlaceholderText('John Doe');
    const emailInput = screen.getByPlaceholderText('name@example.com');
    const [passwordInput, confirmPasswordInput] = screen.getAllByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Register Account/i });

    await userEvent.type(nameInput, 'Sarah Connor');
    await userEvent.type(emailInput, 'sarah@watermelon.ui');
    await userEvent.type(passwordInput, 'validpass123');
    await userEvent.type(confirmPasswordInput, 'validpass123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(signUp.email).toHaveBeenCalledWith({
        name: 'Sarah Connor',
        email: 'sarah@watermelon.ui',
        password: 'validpass123',
        role: UserRole.User,
      });
      expect(mockRouterPush).toHaveBeenCalledWith('/');
    });
  });

  it('should display server error banner when registration fails', async () => {
    vi.mocked(signUp.email).mockResolvedValueOnce({
      data: null,
      error: { message: 'Email is already in use' },
    } as unknown as Awaited<ReturnType<typeof signUp.email>>);

    render(<RegisterForm />);

    const nameInput = screen.getByPlaceholderText('John Doe');
    const emailInput = screen.getByPlaceholderText('name@example.com');
    const [passwordInput, confirmPasswordInput] = screen.getAllByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Register Account/i });

    await userEvent.type(nameInput, 'Sarah Connor');
    await userEvent.type(emailInput, 'existing@watermelon.ui');
    await userEvent.type(passwordInput, 'validpass123');
    await userEvent.type(confirmPasswordInput, 'validpass123');
    await userEvent.click(submitButton);

    expect(await screen.findByText('Email is already in use')).toBeInTheDocument();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});

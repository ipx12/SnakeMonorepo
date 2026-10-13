import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { signIn } from '@/lib/auth-client';

const mockRouterPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

vi.mock('@/lib/auth-client', () => ({
  signIn: {
    email: vi.fn(),
  },
}));

describe('LoginForm Component Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form fields and demo account credentials correctly', () => {
    render(<LoginForm />);

    expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Auto Fill/i })).toBeInTheDocument();
    expect(screen.getByText('demo@watermelon.ui / password123')).toBeInTheDocument();
  });

  it('should auto-fill credentials when Auto Fill button is clicked', async () => {
    render(<LoginForm />);

    const autoFillButton = screen.getByRole('button', { name: /Auto Fill/i });
    await userEvent.click(autoFillButton);

    const emailInput = screen.getByPlaceholderText('name@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    expect(emailInput).toHaveValue('demo@watermelon.ui');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should show validation errors when submitted with invalid email or empty password', async () => {
    const { container } = render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('name@example.com');
    await userEvent.type(emailInput, 'invalid-email');

    const formElement = container.querySelector('form')!;
    fireEvent.submit(formElement);

    expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
    expect(signIn.email).not.toHaveBeenCalled();
  });

  it('should call signIn.email and navigate to / on successful authentication', async () => {
    vi.mocked(signIn.email).mockResolvedValueOnce({
      data: { user: { id: 'test-user-id' } },
      error: null,
    } as unknown as Awaited<ReturnType<typeof signIn.email>>);

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('name@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(emailInput, 'user@watermelon.ui');
    await userEvent.type(passwordInput, 'validpassword123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(signIn.email).toHaveBeenCalledWith({
        email: 'user@watermelon.ui',
        password: 'validpassword123',
      });
      expect(mockRouterPush).toHaveBeenCalledWith('/');
    });
  });

  it('should display server error message when authentication fails', async () => {
    vi.mocked(signIn.email).mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid email or password' },
    } as unknown as Awaited<ReturnType<typeof signIn.email>>);

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('name@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(emailInput, 'wrong@watermelon.ui');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(submitButton);

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});

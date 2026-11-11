import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserRole, type Task, type User } from '@snake/types';
import * as apiModule from '../lib/api';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('@/lib/auth-client', () => ({
  useSession: vi.fn().mockReturnValue({ data: null, isPending: false }),
}));

vi.mock('../lib/api', () => ({
  getTasks: vi.fn(),
  getTaskById: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

const { mockToast } = vi.hoisted(() => {
  interface MockToastFn {
    (message: string, options?: unknown): void;
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    warning: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
  }

  const toastFn = vi.fn() as unknown as MockToastFn;
  toastFn.success = vi.fn();
  toastFn.error = vi.fn();
  toastFn.warning = vi.fn();
  toastFn.info = vi.fn();

  return { mockToast: toastFn };
});

vi.mock('@/components/ui/sonner', () => ({
  toast: mockToast,
}));

import { TaskDetailContainer } from '../components/tasks/TaskDetailContainer';

function renderWithQueryClient(ui: React.ReactElement) {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(<QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>);
}

const mockAuthenticatedUser: User = {
  id: 'user-123',
  name: 'Alex Mercer',
  email: 'alex@watermelon.ui',
  role: UserRole.User,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const mockDetailTask: Task = {
  id: 'task-detail-1',
  title: 'Implement Dynamic Task Page',
  description: 'Build /tasks/[id] with TanStack Query and Watermelon UI',
  completed: false,
  userId: 'user-123',
  createdAt: '2026-04-10T12:00:00.000Z',
};

describe('TaskDetailContainer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sign in prompt when user is unauthenticated', () => {
    renderWithQueryClient(<TaskDetailContainer taskId="task-detail-1" initialUser={null} />);

    expect(screen.getByText('Please Sign In')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Dashboard/i })).toHaveAttribute('href', '/');
  });

  it('should render task details, status badge, UTC timestamp, and ID when loaded', async () => {
    vi.mocked(apiModule.getTaskById).mockResolvedValueOnce(mockDetailTask);

    renderWithQueryClient(
      <TaskDetailContainer taskId="task-detail-1" initialUser={mockAuthenticatedUser} />
    );

    expect(await screen.findByText('Implement Dynamic Task Page')).toBeInTheDocument();
    expect(
      screen.getByText('Build /tasks/[id] with TanStack Query and Watermelon UI')
    ).toBeInTheDocument();
    expect(screen.getByText('task-detail-1')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText(/UTC/)).toBeInTheDocument();
  });

  it('should render error card without redundant client fetch when initialErrorMessage is passed from SSR', () => {
    renderWithQueryClient(
      <TaskDetailContainer
        taskId="missing-task"
        initialUser={mockAuthenticatedUser}
        initialErrorMessage="Task not found"
      />
    );

    expect(screen.getByText('Task Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Task not found')).toBeInTheDocument();
    expect(apiModule.getTaskById).not.toHaveBeenCalled();
  });

  it('should toggle task completion when Mark as Completed is clicked', async () => {
    vi.mocked(apiModule.getTaskById).mockResolvedValue(mockDetailTask);
    vi.mocked(apiModule.updateTask).mockResolvedValueOnce({
      ...mockDetailTask,
      completed: true,
    });

    renderWithQueryClient(
      <TaskDetailContainer taskId="task-detail-1" initialUser={mockAuthenticatedUser} />
    );

    const toggleButton = await screen.findByRole('button', { name: /Mark as Completed/i });
    await userEvent.click(toggleButton);

    await waitFor(() => {
      expect(apiModule.updateTask).toHaveBeenCalledWith('task-detail-1', { completed: true });
      expect(mockToast.success).toHaveBeenCalledWith('Task marked as completed');
    });
  });

  it('should validate empty title with Zod and allow editing task title and description inline', async () => {
    vi.mocked(apiModule.getTaskById).mockResolvedValue(mockDetailTask);
    const updatedTask: Task = {
      ...mockDetailTask,
      title: 'Updated Dynamic Task Title',
      description: 'Updated description content',
    };
    vi.mocked(apiModule.updateTask).mockResolvedValueOnce(updatedTask);

    renderWithQueryClient(
      <TaskDetailContainer taskId="task-detail-1" initialUser={mockAuthenticatedUser} />
    );

    const editButton = await screen.findByRole('button', { name: /Edit Task/i });
    await userEvent.click(editButton);

    const titleInput = screen.getByLabelText(/Task Title/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const saveButton = screen.getByRole('button', { name: /Save Changes/i });

    // Submit with empty title to verify Zod validation
    await userEvent.clear(titleInput);
    await userEvent.click(saveButton);
    expect(await screen.findByText('Title cannot be empty')).toBeInTheDocument();
    expect(apiModule.updateTask).not.toHaveBeenCalled();

    // Enter valid title and description
    await userEvent.type(titleInput, 'Updated Dynamic Task Title');
    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, 'Updated description content');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(apiModule.updateTask).toHaveBeenCalledWith('task-detail-1', {
        title: 'Updated Dynamic Task Title',
        description: 'Updated description content',
      });
      expect(mockToast.success).toHaveBeenCalledWith('Task updated successfully');
    });
  });

  it('should require delete confirmation, trigger Undo warning toast, and navigate back to dashboard', async () => {
    vi.mocked(apiModule.getTaskById).mockResolvedValue(mockDetailTask);
    vi.mocked(apiModule.deleteTask).mockResolvedValueOnce(undefined);
    vi.mocked(apiModule.createTask).mockResolvedValueOnce(mockDetailTask);

    renderWithQueryClient(
      <TaskDetailContainer taskId="task-detail-1" initialUser={mockAuthenticatedUser} />
    );

    const deleteButton = await screen.findByRole('button', { name: /Delete Task/i });
    await userEvent.click(deleteButton);

    // Confirm step appears
    const confirmDeleteButton = screen.getByRole('button', { name: /Confirm Delete/i });
    await userEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(apiModule.deleteTask).toHaveBeenCalledWith('task-detail-1');
      expect(mockPush).toHaveBeenCalledWith('/');
      expect(mockToast.warning).toHaveBeenCalledWith(
        'Task deleted',
        expect.objectContaining({
          description: 'Implement Dynamic Task Page',
          action: expect.objectContaining({
            label: 'Undo',
          }),
        })
      );
    });

    // Trigger Undo action from toast
    const lastToastCall = vi.mocked(mockToast.warning).mock.calls[0];
    const toastOptions = lastToastCall[1] as { action?: { onClick?: () => void } };
    toastOptions?.action?.onClick?.();

    await waitFor(() => {
      expect(apiModule.createTask).toHaveBeenCalledWith(
        'Implement Dynamic Task Page',
        'Build /tasks/[id] with TanStack Query and Watermelon UI'
      );
      expect(mockToast.success).toHaveBeenCalledWith('Task restored');
    });
  });
});

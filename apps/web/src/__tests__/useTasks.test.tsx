import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useTasks } from '../hooks/use-tasks';
import * as apiModule from '../lib/api';
import { toast } from '../components/ui/sonner';
import { taskKeys } from '@snake/types';
import type { Task } from '../lib/api';

vi.mock('../lib/api', () => ({
  getTasks: vi.fn(),
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

vi.mock('../components/ui/sonner', () => ({
  toast: mockToast,
}));

function createTestWrapper() {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const WrapperComponent = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );

  return { testQueryClient, WrapperComponent };
}

const initialMockTasks: Task[] = [
  {
    id: 'task-101',
    title: 'Initial Task 1',
    description: 'First test description',
    completed: false,
    userId: 'user-1',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'task-102',
    title: 'Initial Task 2',
    description: 'Second test description',
    completed: true,
    userId: 'user-1',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
];

describe('useTasks Hook with TanStack Query v5', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return task list successfully', async () => {
    vi.mocked(apiModule.getTasks).mockResolvedValueOnce(initialMockTasks);
    const { WrapperComponent } = createTestWrapper();

    const { result } = renderHook(() => useTasks(), { wrapper: WrapperComponent });

    await waitFor(() => {
      expect(result.current.taskList).toEqual(initialMockTasks);
      expect(result.current.isTasksLoading).toBe(false);
      expect(result.current.errorMessage).toBe('');
    });
  });

  it('should return error message when tasks query fails', async () => {
    vi.mocked(apiModule.getTasks).mockRejectedValueOnce(new Error('Database offline'));
    const { WrapperComponent } = createTestWrapper();

    const { result } = renderHook(() => useTasks(), { wrapper: WrapperComponent });

    await waitFor(() => {
      expect(result.current.errorMessage).toBe('Database offline');
      expect(result.current.isTasksLoading).toBe(false);
    });
  });

  it('should create a new task and trigger success toast', async () => {
    const { testQueryClient, WrapperComponent } = createTestWrapper();
    testQueryClient.setQueryData(taskKeys.all, initialMockTasks);

    const createdTask: Task = {
      id: 'task-103',
      title: 'Brand New Task',
      description: 'Brand new description',
      completed: false,
      userId: 'user-1',
      createdAt: '2026-01-03T00:00:00.000Z',
    };

    vi.mocked(apiModule.createTask).mockResolvedValueOnce(createdTask);

    const { result } = renderHook(() => useTasks(), { wrapper: WrapperComponent });

    act(() => {
      result.current.createTask({
        title: 'Brand New Task',
        description: 'Brand new description',
      });
    });

    await waitFor(() => {
      expect(apiModule.createTask).toHaveBeenCalledWith(
        'Brand New Task',
        'Brand new description'
      );
      expect(toast.success).toHaveBeenCalledWith('Task created successfully');
    });
  });

  it('should toggle task completion optimistically', async () => {
    const { testQueryClient, WrapperComponent } = createTestWrapper();
    testQueryClient.setQueryData(taskKeys.all, initialMockTasks);

    let resolveMutationPromise: (value: Task) => void = () => {};
    const mutationPendingPromise = new Promise<Task>((resolve) => {
      resolveMutationPromise = resolve;
    });
    vi.mocked(apiModule.updateTask).mockReturnValueOnce(mutationPendingPromise);

    const { result } = renderHook(() => useTasks(), { wrapper: WrapperComponent });

    act(() => {
      result.current.toggleTaskCompletion(initialMockTasks[0]);
    });

    // Verify optimistic update has mutated the local cache
    await waitFor(() => {
      const cachedTasksAfterOptimisticUpdate = testQueryClient.getQueryData<Task[]>(taskKeys.all);
      const optimisticTask = cachedTasksAfterOptimisticUpdate?.find(
        (taskItem) => taskItem.id === initialMockTasks[0].id
      );
      expect(optimisticTask?.completed).toBe(true);
    });

    // Resolve server response
    await act(async () => {
      resolveMutationPromise({
        ...initialMockTasks[0],
        completed: true,
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Task marked as completed');
    });
  });

  it('should rollback task completion status when update fails', async () => {
    const { testQueryClient, WrapperComponent } = createTestWrapper();
    testQueryClient.setQueryData(taskKeys.all, initialMockTasks);

    vi.mocked(apiModule.updateTask).mockRejectedValueOnce(new Error('Network failure'));

    const { result } = renderHook(() => useTasks(), { wrapper: WrapperComponent });

    act(() => {
      result.current.toggleTaskCompletion(initialMockTasks[0]);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update task');
    });

    // Verify cache has been rolled back to original uncompleted state
    const cachedTasksAfterRollback = testQueryClient.getQueryData<Task[]>(taskKeys.all);
    const rolledBackTask = cachedTasksAfterRollback?.find(
      (taskItem) => taskItem.id === initialMockTasks[0].id
    );
    expect(rolledBackTask?.completed).toBe(false);
  });

  it('should optimistically remove task from cache on deletion and trigger yellow warning undo toast', async () => {
    const { testQueryClient, WrapperComponent } = createTestWrapper();
    testQueryClient.setQueryData(taskKeys.all, initialMockTasks);

    let resolveDeletePromise: () => void = () => {};
    const deletePendingPromise = new Promise<void>((resolve) => {
      resolveDeletePromise = resolve;
    });
    vi.mocked(apiModule.deleteTask).mockReturnValueOnce(deletePendingPromise);

    const { result } = renderHook(() => useTasks(), { wrapper: WrapperComponent });

    act(() => {
      result.current.deleteTask('task-101');
    });

    // Wait for onMutate to execute: task-101 removed from query client cache
    await waitFor(() => {
      const cachedTasksAfterOptimisticDelete = testQueryClient.getQueryData<Task[]>(taskKeys.all);
      expect(
        cachedTasksAfterOptimisticDelete?.some((taskItem) => taskItem.id === 'task-101')
      ).toBe(false);
    });

    await act(async () => {
      resolveDeletePromise();
    });

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith(
        'Task deleted',
        expect.objectContaining({
          description: 'Initial Task 1',
          action: expect.objectContaining({
            label: 'Undo',
          }),
        })
      );
    });
  });

  it('should restore task and trigger success toast when Undo action is clicked', async () => {
    const { testQueryClient, WrapperComponent } = createTestWrapper();
    testQueryClient.setQueryData(taskKeys.all, initialMockTasks);

    vi.mocked(apiModule.deleteTask).mockResolvedValueOnce(undefined);
    const restoredTask: Task = {
      id: 'task-101-restored',
      title: 'Initial Task 1',
      description: 'First test description',
      completed: false,
      userId: 'user-1',
      createdAt: new Date().toISOString(),
    };
    vi.mocked(apiModule.createTask).mockResolvedValueOnce(restoredTask);

    const { result } = renderHook(() => useTasks(), { wrapper: WrapperComponent });

    act(() => {
      result.current.deleteTask('task-101');
    });

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith('Task deleted', expect.anything());
    });

    // Extract undo callback from toast call
    const lastToastCall = vi.mocked(toast.warning).mock.calls[0];
    const toastOptions = lastToastCall[1] as { action?: { onClick?: () => void } };
    expect(toastOptions?.action?.onClick).toBeDefined();

    // Trigger Undo
    await act(async () => {
      toastOptions?.action?.onClick?.();
    });

    await waitFor(() => {
      expect(apiModule.createTask).toHaveBeenCalledWith('Initial Task 1', 'First test description');
      expect(toast.success).toHaveBeenCalledWith('Task restored');
    });
  });

  it('should rollback task list when delete fails', async () => {
    const { testQueryClient, WrapperComponent } = createTestWrapper();
    testQueryClient.setQueryData(taskKeys.all, initialMockTasks);

    vi.mocked(apiModule.deleteTask).mockRejectedValueOnce(new Error('Server error on delete'));

    const { result } = renderHook(() => useTasks(), { wrapper: WrapperComponent });

    act(() => {
      result.current.deleteTask('task-101');
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to delete task');
    });

    // Verify cache has been restored
    const cachedTasksAfterFailedDelete = testQueryClient.getQueryData<Task[]>(taskKeys.all);
    expect(
      cachedTasksAfterFailedDelete?.some((taskItem) => taskItem.id === 'task-101')
    ).toBe(true);
  });
});

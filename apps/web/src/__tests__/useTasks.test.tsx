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

vi.mock('../components/ui/sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
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

describe('useTasks Hook Unit Tests', () => {
  const initialMockTasks: Task[] = [
    {
      id: 'task-101',
      title: 'Initial Unit Test Setup',
      description: 'Implement tests with Vitest',
      completed: false,
      userId: 'user-sample-1',
      createdAt: '2026-03-01T10:00:00.000Z',
    },
    {
      id: 'task-102',
      title: 'Monorepo Architecture Review',
      description: 'Check conventions in AGENTS.md',
      completed: true,
      userId: 'user-sample-1',
      createdAt: '2026-03-01T11:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return task list successfully', async () => {
    vi.mocked(apiModule.getTasks).mockResolvedValueOnce(initialMockTasks);
    const { WrapperComponent } = createTestWrapper();

    const { result } = renderHook(() => useTasks(), { wrapper: WrapperComponent });

    await waitFor(() => {
      expect(result.current.isTasksLoading).toBe(false);
    });

    expect(result.current.taskList).toEqual(initialMockTasks);
    expect(result.current.taskList.length).toBe(2);
  });

  it('should create a new task and trigger success toast', async () => {
    vi.mocked(apiModule.getTasks).mockResolvedValue(initialMockTasks);
    const createdTask: Task = {
      id: 'task-103',
      title: 'Newly Created Task',
      description: 'Created description',
      completed: false,
      userId: 'user-sample-1',
      createdAt: '2026-03-01T12:00:00.000Z',
    };
    vi.mocked(apiModule.createTask).mockResolvedValueOnce(createdTask);

    const { WrapperComponent } = createTestWrapper();
    const { result } = renderHook(() => useTasks(), { wrapper: WrapperComponent });

    await waitFor(() => {
      expect(result.current.isTasksLoading).toBe(false);
    });

    await act(async () => {
      await result.current.createTaskAsync({
        title: 'Newly Created Task',
        description: 'Created description',
      });
    });

    expect(apiModule.createTask).toHaveBeenCalledWith(
      'Newly Created Task',
      'Created description'
    );
    expect(toast.success).toHaveBeenCalledWith('Task created successfully');
  });

  it('should optimistically update task completion status immediately', async () => {
    const { testQueryClient, WrapperComponent } = createTestWrapper();
    testQueryClient.setQueryData(taskKeys.all, initialMockTasks);

    let resolveMutationPromise: (value: Task) => void = () => {};
    const mutationPendingPromise = new Promise<Task>((resolve) => {
      resolveMutationPromise = resolve;
    });
    vi.mocked(apiModule.updateTask).mockReturnValueOnce(mutationPendingPromise);

    const { result } = renderHook(() => useTasks(), { wrapper: WrapperComponent });

    // Trigger toggle mutation
    act(() => {
      result.current.toggleTaskCompletion(initialMockTasks[0]);
    });

    // Wait for onMutate to execute and verify optimistic update in cache
    await waitFor(() => {
      const cachedTasksAfterMutation = testQueryClient.getQueryData<Task[]>(taskKeys.all);
      const toggledTask = cachedTasksAfterMutation?.find(
        (taskItem) => taskItem.id === initialMockTasks[0].id
      );
      expect(toggledTask?.completed).toBe(true);
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
    const restoredTask = cachedTasksAfterRollback?.find(
      (taskItem) => taskItem.id === initialMockTasks[0].id
    );
    expect(restoredTask?.completed).toBe(false);
  });

  it('should optimistically remove task from cache on deletion', async () => {
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
      expect(toast.success).toHaveBeenCalledWith('Task deleted');
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

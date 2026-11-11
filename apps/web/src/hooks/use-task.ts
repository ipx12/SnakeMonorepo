'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { createTask, updateTask, deleteTask, type Task } from '@/lib/api';
import { taskKeys } from '@snake/types';
import { taskDetailQueryOptions } from '@/lib/query-options';

export interface UseTaskOptions {
  /** If false, disables automatic query execution (useful when waiting for user session or when SSR returned an initial error) */
  enabled?: boolean;
}

/**
 * Custom React Hook encapsulating TanStack Query v5 server state, optimistic updates,
 * cross-cache synchronization (detail + list), and undoable deletion for a single task.
 *
 * @param taskId - Unique identifier of the target task
 * @param options - Configuration options controlling query enablement
 * @returns Object providing task detail data, loading/error states, and CRUD mutation handlers
 *
 * @example
 * const { task, isTaskLoading, errorMessage, toggleTaskCompletion, updateTask, deleteTask } = useTask('task-123');
 */
export function useTask(taskId: string, options: UseTaskOptions = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();
  const detailQueryKey = taskKeys.detail(taskId);

  const {
    data: task = null,
    isLoading: isTaskLoading,
    isFetching: isTaskFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    ...taskDetailQueryOptions(taskId),
    enabled: enabled && Boolean(taskId),
    placeholderData: () => {
      const cachedTaskList = queryClient.getQueryData<Task[]>(taskKeys.all);
      return cachedTaskList?.find((cachedTask) => cachedTask.id === taskId);
    },
  });

  const errorMessage = isError && error instanceof Error ? error.message : '';

  // Mutation: Toggle completion status with optimistic update across both detail and list caches
  const toggleCompletionMutation = useMutation({
    mutationFn: ({ targetTask, completed }: { targetTask: Task; completed: boolean }) =>
      updateTask(targetTask.id, { completed }),
    onMutate: async ({ targetTask, completed }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const previousTask = queryClient.getQueryData<Task>(detailQueryKey);
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.all);

      queryClient.setQueryData<Task>(detailQueryKey, {
        ...(previousTask ?? targetTask),
        completed,
      });

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(taskKeys.all, (cachedTasks) =>
          cachedTasks?.map((existingTask) =>
            existingTask.id === targetTask.id ? { ...existingTask, completed } : existingTask
          )
        );
      }

      return { previousTask, previousTasks };
    },
    onError: (_mutationError, _mutationVariables, mutationContext) => {
      if (mutationContext?.previousTask) {
        queryClient.setQueryData(detailQueryKey, mutationContext.previousTask);
      }
      if (mutationContext?.previousTasks) {
        queryClient.setQueryData(taskKeys.all, mutationContext.previousTasks);
      }
      toast.error('Failed to update task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
    onSuccess: (_updatedTask, mutationVariables) => {
      toast.success(
        mutationVariables.completed ? 'Task marked as completed' : 'Task marked as pending'
      );
    },
  });

  // Mutation: Update task title & description
  const updateMutation = useMutation({
    mutationFn: ({
      title,
      description,
    }: {
      title: string;
      description: string;
    }) => updateTask(taskId, { title, description }),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(detailQueryKey, updatedTask);
      queryClient.setQueryData<Task[]>(taskKeys.all, (cachedTasks) =>
        cachedTasks?.map((existingTask) =>
          existingTask.id === updatedTask.id ? updatedTask : existingTask
        )
      );
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success('Task updated successfully');
    },
    onError: (mutationError) => {
      toast.error(
        mutationError instanceof Error ? mutationError.message : 'Failed to update task'
      );
    },
  });

  // Mutation: Restore task (used by Undo action in the deletion warning toast)
  const restoreTaskMutation = useMutation({
    mutationFn: async (taskToRestore: Task) => {
      const restoredTask = await createTask(
        taskToRestore.title,
        taskToRestore.description || ''
      );
      if (taskToRestore.completed) {
        return await updateTask(restoredTask.id, { completed: true });
      }
      return restoredTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success('Task restored');
    },
    onError: () => {
      toast.error('Failed to restore task');
    },
  });

  // Mutation: Delete task with optimistic list removal and Undo toast
  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(taskId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.all);
      const deletedTask =
        queryClient.getQueryData<Task>(detailQueryKey) ??
        task ??
        previousTasks?.find((existingTask) => existingTask.id === taskId) ??
        null;

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(taskKeys.all, (cachedTasks) =>
          cachedTasks?.filter((existingTask) => existingTask.id !== taskId)
        );
      }

      return { previousTasks, deletedTask };
    },
    onError: (mutationError, _variables, mutationContext) => {
      if (mutationContext?.previousTasks) {
        queryClient.setQueryData(taskKeys.all, mutationContext.previousTasks);
      }
      toast.error(
        mutationError instanceof Error ? mutationError.message : 'Failed to delete task'
      );
    },
    onSuccess: (_data, _variables, mutationContext) => {
      const deletedTask = mutationContext?.deletedTask;
      queryClient.removeQueries({ queryKey: detailQueryKey });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.warning('Task deleted', {
        description: deletedTask ? deletedTask.title : undefined,
        action: deletedTask
          ? {
              label: 'Undo',
              onClick: () => {
                restoreTaskMutation.mutate(deletedTask);
              },
            }
          : undefined,
      });
    },
  });

  return {
    task,
    isTaskLoading,
    isTaskFetching,
    errorMessage,
    toggleTaskCompletion: (targetTask: Task) =>
      toggleCompletionMutation.mutate({ targetTask, completed: !targetTask.completed }),
    isTogglingCompletion: toggleCompletionMutation.isPending,
    updateTask: updateMutation.mutate,
    updateTaskAsync: updateMutation.mutateAsync,
    isUpdatingTask: updateMutation.isPending,
    deleteTask: deleteMutation.mutate,
    deleteTaskAsync: deleteMutation.mutateAsync,
    isDeletingTask: deleteMutation.isPending,
    restoreTask: restoreTaskMutation.mutate,
    isRestoringTask: restoreTaskMutation.isPending,
    refetch,
  };
}

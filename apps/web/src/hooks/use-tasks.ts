'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { createTask, updateTask, deleteTask, type Task } from '@/lib/api';
import { taskKeys } from '@snake/types';
import { tasksQueryOptions } from '@/lib/query-options';

export interface UseTasksOptions {
  enabled?: boolean;
}

export function useTasks(options: UseTasksOptions = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  // Fetch tasks query
  const {
    data: taskList = [],
    isLoading: isTasksLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    ...tasksQueryOptions(),
    enabled,
  });

  const errorMessage = isError && error instanceof Error ? error.message : '';

  // Mutation: Create task
  const createMutation = useMutation({
    mutationFn: ({ title, description }: { title: string; description: string }) =>
      createTask(title, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success('Task created successfully');
    },
    onError: (mutationError) => {
      toast.error(
        mutationError instanceof Error ? mutationError.message : 'Failed to create task'
      );
    },
  });

  // Mutation: Toggle completion status with optimistic update
  const toggleCompletionMutation = useMutation({
    mutationFn: ({ task, completed }: { task: Task; completed: boolean }) =>
      updateTask(task.id, { completed }),
    onMutate: async ({ task, completed }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.all);

      queryClient.setQueryData<Task[]>(taskKeys.all, (cachedTasks) =>
        cachedTasks?.map((existingTask) =>
          existingTask.id === task.id ? { ...existingTask, completed } : existingTask
        )
      );

      return { previousTasks };
    },
    onError: (_mutationError, _mutationVariables, mutationContext) => {
      if (mutationContext?.previousTasks) {
        queryClient.setQueryData(taskKeys.all, mutationContext.previousTasks);
      }
      toast.error('Failed to update task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
    onSuccess: (_data, mutationVariables) => {
      toast.success(
        mutationVariables.completed ? 'Task marked as completed' : 'Task marked as pending'
      );
    },
  });

  // Mutation: Update task title & description
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      title,
      description,
    }: {
      id: string;
      title: string;
      description: string;
    }) => updateTask(id, { title, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success('Task updated successfully');
    },
    onError: (mutationError) => {
      toast.error(
        mutationError instanceof Error ? mutationError.message : 'Failed to update task'
      );
    },
  });

  // Mutation: Delete task with optimistic update
  const deleteMutation = useMutation({
    mutationFn: (targetTaskId: string) => deleteTask(targetTaskId),
    onMutate: async (targetTaskId) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.all);

      queryClient.setQueryData<Task[]>(taskKeys.all, (cachedTasks) =>
        cachedTasks?.filter((existingTask) => existingTask.id !== targetTaskId)
      );

      return { previousTasks };
    },
    onError: (_mutationError, _targetTaskId, mutationContext) => {
      if (mutationContext?.previousTasks) {
        queryClient.setQueryData(taskKeys.all, mutationContext.previousTasks);
      }
      toast.error('Failed to delete task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
    onSuccess: () => {
      toast.success('Task deleted');
    },
  });

  return {
    taskList,
    isTasksLoading,
    errorMessage,
    createTask: createMutation.mutate,
    createTaskAsync: createMutation.mutateAsync,
    isCreatingTask: createMutation.isPending,
    toggleTaskCompletion: (task: Task) =>
      toggleCompletionMutation.mutate({ task, completed: !task.completed }),
    updateTask: updateMutation.mutate,
    updateTaskAsync: updateMutation.mutateAsync,
    isUpdatingTask: updateMutation.isPending,
    deleteTask: deleteMutation.mutate,
    isDeletingTask: deleteMutation.isPending,
    refreshTasks: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
    refetch,
  };
}

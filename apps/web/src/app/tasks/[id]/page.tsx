import { cache } from 'react';
import { TaskDetailContainer } from '@/components/tasks/TaskDetailContainer';
import { type Metadata } from 'next';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getTaskByIdServer } from '@/lib/api-server';
import { getServerSession } from '@/lib/auth-server';
import { taskKeys } from '@snake/types';

export interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Request-scoped memoized task fetcher so `generateMetadata` and `TaskDetailPage`
 * share a single backend roundtrip per RSC render pass.
 */
const getCachedTaskById = cache(async (taskId: string) => {
  return getTaskByIdServer(taskId);
});

/**
 * Dynamically generates the page metadata using the fetched task title when available.
 */
export async function generateMetadata({ params }: TaskDetailPageProps): Promise<Metadata> {
  const [{ id: taskId }, { user }] = await Promise.all([params, getServerSession()]);

  if (!user || !taskId) {
    return {
      title: 'Task Details - Watermelon UI',
      description: 'View and manage your task details',
    };
  }

  try {
    const foundTask = await getCachedTaskById(taskId);
    if (foundTask?.title) {
      return {
        title: `${foundTask.title} - Watermelon UI`,
        description: foundTask.description || 'View and manage your task details',
      };
    }
  } catch {
    // Fallback to default metadata when task is not found or inaccessible
  }

  return {
    title: 'Task Details - Watermelon UI',
    description: 'View and manage your task details',
  };
}

/**
 * Server Component for the dynamic Task Detail route (`/tasks/[id]`).
 * Verifies user session on the server and prefetches the task detail query
 * before hydrating the client container, forwarding any SSR lookup error
 * to avoid a redundant 404/403 client refetch.
 */
export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const [{ id: taskId }, { user }] = await Promise.all([params, getServerSession()]);
  const queryClient = new QueryClient();
  let initialErrorMessage: string | undefined;

  if (user && taskId) {
    try {
      await queryClient.query({
        queryKey: taskKeys.detail(taskId),
        queryFn: () => getCachedTaskById(taskId),
      });
    } catch (caughtError: unknown) {
      initialErrorMessage =
        caughtError instanceof Error ? caughtError.message : 'Failed to fetch task';
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TaskDetailContainer
        taskId={taskId}
        initialUser={user}
        initialErrorMessage={initialErrorMessage}
      />
    </HydrationBoundary>
  );
}

import { TaskDetailLoadingSkeleton } from '@/components/tasks/TaskDetailLoadingSkeleton';

/**
 * Instant loading UI for the /tasks/[id] route segment.
 * Automatically wraps page.tsx in a Suspense boundary for streaming and PPR.
 */
export default function Loading() {
  return <TaskDetailLoadingSkeleton />;
}


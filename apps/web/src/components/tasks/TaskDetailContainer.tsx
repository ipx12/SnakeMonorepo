'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { UserRole, type TaskEditFormData } from '@snake/types';
import type { User } from '@/lib/api';
import { useTask } from '@/hooks/use-task';
import { TaskDetailCard } from './TaskDetailCard';
import {
  TaskDetailBackNav,
  TaskDetailErrorCard,
  TaskDetailLoadingState,
  TaskDetailSignInCard,
} from './TaskDetailStates';

export interface TaskDetailContainerProps {
  /** Unique task identifier from the dynamic route parameter */
  taskId: string;
  /** Optional pre-validated server user model */
  initialUser?: User | null;
  /** Optional server-side prefetch error message (prevents redundant client 404/403 refetch) */
  initialErrorMessage?: string;
}

const VALID_ROLES = new Set<string>([UserRole.Admin, UserRole.User, UserRole.Guest]);

/**
 * Safely normalizes a Better Auth client session user into the domain `User` interface.
 *
 * @param sessionUser - Raw user object from `useSession()`
 * @returns Normalized `User` object or `null`
 */
function normalizeSessionUser(
  sessionUser:
    | {
        id: string;
        name: string;
        email: string;
        role?: string;
        createdAt?: Date | string;
      }
    | undefined
): User | null {
  if (!sessionUser) return null;
  const resolvedRole =
    sessionUser.role && VALID_ROLES.has(sessionUser.role)
      ? (sessionUser.role as UserRole)
      : UserRole.User;
  const resolvedCreatedAt =
    sessionUser.createdAt instanceof Date
      ? sessionUser.createdAt.toISOString()
      : (sessionUser.createdAt ?? '');

  return {
    id: sessionUser.id,
    name: sessionUser.name,
    email: sessionUser.email,
    role: resolvedRole,
    createdAt: resolvedCreatedAt,
  };
}

/**
 * Interactive Client Container for the dynamic task detail page (`/tasks/[id]`).
 * Coordinates authentication state, server-state queries via `useTask`, and delegates
 * rendering to focused state and card subcomponents.
 */
export function TaskDetailContainer({
  taskId,
  initialUser = null,
  initialErrorMessage,
}: TaskDetailContainerProps) {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const currentUser = initialUser ?? normalizeSessionUser(session?.user);
  const isAuthLoading = !initialUser && isSessionPending;

  const {
    task,
    isTaskLoading,
    errorMessage: queryErrorMessage,
    toggleTaskCompletion,
    isTogglingCompletion,
    updateTask,
    isUpdatingTask,
    deleteTask,
    isDeletingTask,
  } = useTask(taskId, {
    enabled: Boolean(currentUser) && !initialErrorMessage,
  });

  const effectiveErrorMessage = queryErrorMessage || initialErrorMessage || '';

  const handleSaveEdit = (formData: TaskEditFormData, onComplete: () => void) => {
    updateTask(
      {
        title: formData.title,
        description: formData.description,
      },
      {
        onSuccess: onComplete,
      }
    );
  };

  const handleConfirmDeleteTask = () => {
    deleteTask(undefined, {
      onSuccess: () => {
        router.push('/');
      },
    });
  };

  const renderMainContent = () => {
    if (isAuthLoading) {
      return <TaskDetailLoadingState label="Loading session..." />;
    }
    if (!currentUser) {
      return <TaskDetailSignInCard />;
    }
    if (isTaskLoading) {
      return <TaskDetailLoadingState label="Loading task details..." />;
    }
    if (effectiveErrorMessage || !task) {
      return <TaskDetailErrorCard errorMessage={effectiveErrorMessage} />;
    }
    return (
      <TaskDetailCard
        task={task}
        isTogglingCompletion={isTogglingCompletion}
        isUpdatingTask={isUpdatingTask}
        isDeletingTask={isDeletingTask}
        onToggleCompletion={toggleTaskCompletion}
        onSaveEdit={handleSaveEdit}
        onConfirmDelete={handleConfirmDeleteTask}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-3xl space-y-6">
        <TaskDetailBackNav />
        {renderMainContent()}
      </div>
    </div>
  );
}

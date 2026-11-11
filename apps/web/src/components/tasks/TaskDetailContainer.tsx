'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useSession } from '@/lib/auth-client';
import { UserRole, taskEditFormSchema, type TaskEditFormData } from '@snake/types';
import type { User } from '@/lib/api';
import { useTask } from '@/hooks/use-task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Hash,
  Lock,
  LogIn,
  Trash2,
  UserPlus,
  AlertCircle,
} from 'lucide-react';

gsap.registerPlugin(useGSAP);

export interface TaskDetailContainerProps {
  /** Unique task identifier from the dynamic route parameter */
  taskId: string;
  /** Optional pre-validated server user model */
  initialUser?: User | null;
  /** Optional server-side prefetch error message (prevents redundant client 404/403 refetch) */
  initialErrorMessage?: string;
}

const utcDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
});

/**
 * Formats an ISO timestamp deterministically in UTC to avoid SSR/client hydration mismatches.
 *
 * @param isoTimestamp - ISO 8601 date string
 * @returns Deterministically formatted UTC timestamp string
 */
function formatTaskTimestampUtc(isoTimestamp?: string): string {
  if (!isoTimestamp) return '';
  const parsedDate = new Date(isoTimestamp);
  if (Number.isNaN(parsedDate.getTime())) return '';
  return `${utcDateTimeFormatter.format(parsedDate)} UTC`;
}

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
    sessionUser.role === UserRole.Admin ||
    sessionUser.role === UserRole.User ||
    sessionUser.role === UserRole.Guest
      ? sessionUser.role
      : UserRole.User;
  const resolvedCreatedAt =
    sessionUser.createdAt instanceof Date
      ? sessionUser.createdAt.toISOString()
      : typeof sessionUser.createdAt === 'string'
        ? sessionUser.createdAt
        : '';

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
 * Supports viewing full task metadata, toggling completion state, validated inline editing
 * via React Hook Form + Zod, and two-step confirmed deletion with Undo toast restoration.
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

  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskEditFormData>({
    resolver: zodResolver(taskEditFormSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
    },
  });

  const detailContainerRef = useRef<HTMLDivElement | null>(null);
  const taskCardRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!taskCardRef.current || !task) return;
      if (process.env.NODE_ENV === 'test') return;

      gsap.fromTo(
        taskCardRef.current,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
          clearProps: 'opacity,transform',
        }
      );
    },
    { scope: detailContainerRef, dependencies: [Boolean(task)] }
  );

  const handleStartEdit = () => {
    if (!task) return;
    reset({
      title: task.title,
      description: task.description || '',
    });
    setIsConfirmingDelete(false);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = (formData: TaskEditFormData) => {
    if (!task) return;

    updateTask(
      {
        title: formData.title,
        description: formData.description,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
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

  const formattedCreatedAt = formatTaskTimestampUtc(task?.createdAt);

  return (
    <div
      ref={detailContainerRef}
      className="min-h-screen bg-background text-foreground flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 font-sans"
    >
      <div className="w-full max-w-3xl space-y-6">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 gap-2 rounded-xl cursor-pointer transition-colors"
          >
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Auth Loading State */}
        {isAuthLoading ? (
          <div className="py-20 px-6 border border-border/60 rounded-2xl bg-secondary/10 backdrop-blur-xl flex flex-col items-center justify-center space-y-4">
            <div className="size-10 animate-spin rounded-full border-3 border-emerald-500 border-t-transparent" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Loading session...
            </span>
          </div>
        ) : !currentUser ? (
          /* Unauthenticated Prompt */
          <div className="py-16 px-6 border border-border/80 rounded-2xl bg-secondary/15 backdrop-blur-xl shadow-xl flex flex-col items-center text-center space-y-5">
            <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
              <Lock className="size-8" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Please Sign In</h2>
              <p className="text-sm text-muted-foreground">
                You need to be signed in to view and manage this task.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/login">
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 cursor-pointer shadow-lg shadow-emerald-500/20">
                  <LogIn className="size-4" /> Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  className="border-border hover:bg-secondary font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 cursor-pointer"
                >
                  <UserPlus className="size-4 text-emerald-400" /> Register
                </Button>
              </Link>
            </div>
          </div>
        ) : isTaskLoading ? (
          /* Task Loading State */
          <div className="py-20 px-6 border border-border/60 rounded-2xl bg-secondary/10 backdrop-blur-xl flex flex-col items-center justify-center space-y-4">
            <div className="size-10 animate-spin rounded-full border-3 border-emerald-500 border-t-transparent" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Loading task details...
            </span>
          </div>
        ) : effectiveErrorMessage || !task ? (
          /* Task Not Found or Error State */
          <div className="py-16 px-6 border border-destructive/30 rounded-2xl bg-destructive/5 backdrop-blur-xl shadow-xl flex flex-col items-center text-center space-y-5">
            <div className="size-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
              <AlertCircle className="size-8" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                Task Unavailable
              </h2>
              <p className="text-sm text-muted-foreground">
                {effectiveErrorMessage ||
                  'The requested task could not be found or you do not have permission to view it.'}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-border hover:bg-secondary font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 cursor-pointer"
            >
              <Link href="/">
                <ArrowLeft className="size-4" /> Return to Dashboard
              </Link>
            </Button>
          </div>
        ) : (
          /* Main Task Detail Card */
          <div
            ref={taskCardRef}
            className="p-6 sm:p-8 rounded-2xl bg-secondary/15 border border-border/80 backdrop-blur-xl shadow-2xl space-y-6"
          >
            {/* Status Badge & Created Timestamp Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  task.completed
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}
              >
                {task.completed ? (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    Completed
                  </>
                ) : (
                  <>
                    <Clock className="size-3.5" />
                    Pending
                  </>
                )}
              </span>

              {formattedCreatedAt && (
                <time
                  dateTime={task.createdAt}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <Calendar className="size-3.5 text-teal-400" />
                  Created {formattedCreatedAt}
                </time>
              )}
            </div>

            {isEditing ? (
              /* Validated Inline Edit Form (React Hook Form + Zod) */
              <form onSubmit={handleSubmit(handleSaveEdit)} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <label
                    htmlFor="task-detail-title"
                    className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Task Title
                  </label>
                  <Input
                    id="task-detail-title"
                    type="text"
                    {...register('title')}
                    aria-invalid={Boolean(errors.title)}
                    className="bg-background/80"
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.title.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="task-detail-description"
                    className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Description
                  </label>
                  <Textarea
                    id="task-detail-description"
                    {...register('description')}
                    rows={4}
                    className="bg-background/80 resize-y"
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.description.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isUpdatingTask}
                    className="bg-emerald-500 hover:bg-emerald-400 text-primary-foreground font-semibold px-4 cursor-pointer"
                  >
                    {isUpdatingTask ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="px-4 cursor-pointer border border-border"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              /* Task Content View */
              <>
                <div className="space-y-2 min-w-0">
                  <h1
                    className={`text-2xl sm:text-3xl font-extrabold tracking-tight break-words ${
                      task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    {task.title}
                  </h1>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono break-all">
                    <Hash className="size-3.5 shrink-0 text-teal-400" />
                    <span>{task.id}</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-secondary/20 border border-border/60 min-h-24">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Description
                  </h2>
                  {task.description ? (
                    <p className="text-sm sm:text-base text-foreground/90 whitespace-pre-wrap leading-relaxed break-words">
                      {task.description}
                    </p>
                  ) : (
                    <p className="text-sm italic text-muted-foreground/70">
                      No description provided for this task.
                    </p>
                  )}
                </div>

                {/* Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/50">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isTogglingCompletion}
                    onClick={() => toggleTaskCompletion(task)}
                    className="border-border hover:bg-secondary font-semibold text-xs px-4 py-2 rounded-xl gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    {task.completed ? 'Mark as Pending' : 'Mark as Completed'}
                  </Button>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleStartEdit}
                      className="border border-border hover:bg-secondary/80 font-semibold text-xs px-4 py-2 rounded-xl gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="size-3.5 text-emerald-400" />
                      Edit Task
                    </Button>

                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={isDeletingTask}
                          onClick={handleConfirmDeleteTask}
                          className="font-semibold text-xs px-3.5 py-2 rounded-xl gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                          {isDeletingTask ? 'Deleting...' : 'Confirm Delete'}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isDeletingTask}
                          onClick={() => setIsConfirmingDelete(false)}
                          className="font-semibold text-xs px-3 py-2 rounded-xl cursor-pointer"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={isDeletingTask}
                        onClick={() => setIsConfirmingDelete(true)}
                        className="font-semibold text-xs px-4 py-2 rounded-xl gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                        Delete Task
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

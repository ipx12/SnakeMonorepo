'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { TaskEditFormData } from '@snake/types';
import type { Task } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, Clock, Edit2, Hash, Trash2 } from 'lucide-react';
import { TaskDetailEditForm } from './TaskDetailEditForm';

gsap.registerPlugin(useGSAP);

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

interface TaskDetailMetaHeaderProps {
  isCompleted: boolean;
  createdAt: string;
}

function TaskDetailMetaHeader({ isCompleted, createdAt }: TaskDetailMetaHeaderProps) {
  const formattedCreatedAt = formatTaskTimestampUtc(createdAt);
  const badgeStyle = isCompleted
    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    : 'bg-amber-500/15 text-amber-300 border-amber-500/30';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}
      >
        {isCompleted ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />}
        {isCompleted ? 'Completed' : 'Pending'}
      </span>

      {formattedCreatedAt && (
        <time
          dateTime={createdAt}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Calendar className="size-3.5 text-teal-400" />
          Created {formattedCreatedAt}
        </time>
      )}
    </div>
  );
}

interface TaskDeleteActionBarProps {
  isConfirmingDelete: boolean;
  isDeletingTask: boolean;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

function TaskDeleteActionBar({
  isConfirmingDelete,
  isDeletingTask,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: TaskDeleteActionBarProps) {
  if (!isConfirmingDelete) {
    return (
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={isDeletingTask}
        onClick={onRequestDelete}
        className="font-semibold text-xs px-4 py-2 rounded-xl gap-1.5 cursor-pointer"
      >
        <Trash2 className="size-3.5" />
        Delete Task
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={isDeletingTask}
        onClick={onConfirmDelete}
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
        onClick={onCancelDelete}
        className="font-semibold text-xs px-3 py-2 rounded-xl cursor-pointer"
      >
        Cancel
      </Button>
    </div>
  );
}

interface TaskDetailReadViewProps {
  task: Task;
  isTogglingCompletion: boolean;
  isDeletingTask: boolean;
  isConfirmingDelete: boolean;
  onToggleCompletion: (targetTask: Task) => void;
  onStartEdit: () => void;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

function TaskDetailReadView({
  task,
  isTogglingCompletion,
  isDeletingTask,
  isConfirmingDelete,
  onToggleCompletion,
  onStartEdit,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: TaskDetailReadViewProps) {
  const titleTextStyle = task.completed ? 'line-through text-muted-foreground' : 'text-foreground';
  const toggleButtonLabel = task.completed ? 'Mark as Pending' : 'Mark as Completed';

  return (
    <>
      <div className="space-y-2 min-w-0">
        <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight break-words ${titleTextStyle}`}>
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

      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/50">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isTogglingCompletion}
          onClick={() => onToggleCompletion(task)}
          className="border-border hover:bg-secondary font-semibold text-xs px-4 py-2 rounded-xl gap-2 cursor-pointer"
        >
          <CheckCircle2 className="size-4 text-emerald-400" />
          {toggleButtonLabel}
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onStartEdit}
            className="border border-border hover:bg-secondary/80 font-semibold text-xs px-4 py-2 rounded-xl gap-1.5 cursor-pointer"
          >
            <Edit2 className="size-3.5 text-emerald-400" />
            Edit Task
          </Button>

          <TaskDeleteActionBar
            isConfirmingDelete={isConfirmingDelete}
            isDeletingTask={isDeletingTask}
            onRequestDelete={onRequestDelete}
            onCancelDelete={onCancelDelete}
            onConfirmDelete={onConfirmDelete}
          />
        </div>
      </div>
    </>
  );
}

export interface TaskDetailCardProps {
  /** The loaded task entity to display */
  task: Task;
  /** Whether the completion status mutation is currently pending */
  isTogglingCompletion: boolean;
  /** Whether the update mutation is currently pending */
  isUpdatingTask: boolean;
  /** Whether the delete mutation is currently pending */
  isDeletingTask: boolean;
  /** Handler to toggle task completion state */
  onToggleCompletion: (targetTask: Task) => void;
  /** Handler to persist title/description edits */
  onSaveEdit: (formData: TaskEditFormData, onComplete: () => void) => void;
  /** Handler to permanently delete the task */
  onConfirmDelete: () => void;
}

/**
 * Presentational and interactive card displaying a single task's status badge,
 * UTC creation date, title, ID, description, inline edit toggle, and two-step deletion.
 */
export function TaskDetailCard({
  task,
  isTogglingCompletion,
  isUpdatingTask,
  isDeletingTask,
  onToggleCompletion,
  onSaveEdit,
  onConfirmDelete,
}: TaskDetailCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const taskCardRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!taskCardRef.current || process.env.NODE_ENV === 'test') return;

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
    { scope: taskCardRef }
  );

  const handleStartEdit = () => {
    setIsConfirmingDelete(false);
    setIsEditing(true);
  };

  const handleSaveForm = (formData: TaskEditFormData) => {
    onSaveEdit(formData, () => setIsEditing(false));
  };

  return (
    <div
      ref={taskCardRef}
      className="p-6 sm:p-8 rounded-2xl bg-secondary/15 border border-border/80 backdrop-blur-xl shadow-2xl space-y-6"
    >
      <TaskDetailMetaHeader isCompleted={task.completed} createdAt={task.createdAt} />

      {isEditing ? (
        <TaskDetailEditForm
          initialTitle={task.title}
          initialDescription={task.description || ''}
          isSubmitting={isUpdatingTask}
          onSave={handleSaveForm}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <TaskDetailReadView
          task={task}
          isTogglingCompletion={isTogglingCompletion}
          isDeletingTask={isDeletingTask}
          isConfirmingDelete={isConfirmingDelete}
          onToggleCompletion={onToggleCompletion}
          onStartEdit={handleStartEdit}
          onRequestDelete={() => setIsConfirmingDelete(true)}
          onCancelDelete={() => setIsConfirmingDelete(false)}
          onConfirmDelete={onConfirmDelete}
        />
      )}
    </div>
  );
}

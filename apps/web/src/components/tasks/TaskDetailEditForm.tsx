'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskEditFormSchema, type TaskEditFormData } from '@snake/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface TaskDetailEditFormProps {
  /** Initial title value for the form */
  initialTitle: string;
  /** Initial description value for the form */
  initialDescription: string;
  /** Whether the update mutation is currently in flight */
  isSubmitting: boolean;
  /** Callback invoked with validated form data on submit */
  onSave: (formData: TaskEditFormData) => void;
  /** Callback invoked when the user cancels editing */
  onCancel: () => void;
}

/**
 * Validated inline edit form for updating a task's title and description
 * using React Hook Form and Zod (`taskEditFormSchema`).
 */
export function TaskDetailEditForm({
  initialTitle,
  initialDescription,
  isSubmitting,
  onSave,
  onCancel,
}: TaskDetailEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskEditFormData>({
    resolver: zodResolver(taskEditFormSchema),
    defaultValues: {
      title: initialTitle,
      description: initialDescription,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4" noValidate>
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
          <p className="text-xs text-destructive font-medium">{errors.title.message}</p>
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
          <p className="text-xs text-destructive font-medium">{errors.description.message}</p>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting}
          className="bg-emerald-500 hover:bg-emerald-400 text-primary-foreground font-semibold px-4 cursor-pointer"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
          className="px-4 cursor-pointer border border-border"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}


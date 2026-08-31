import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import type { Task } from '@/lib/api';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  items: Task[];
  loading: boolean;
  editingItem: Task | null;
  editTitle: string;
  editDescription: string;
  setEditTitle: (newTitle: string) => void;
  setEditDescription: (newDescription: string) => void;
  onRefresh: () => void;
  onToggle: (targetTask: Task) => void;
  onStartEdit: (targetTask: Task) => void;
  onSaveEdit: (event: React.FormEvent) => void;
  onCancelEdit: () => void;
  onDelete: (taskId: string) => void;
}

export function TaskList({
  items: taskList,
  loading: isTasksLoading,
  editingItem: editingTask,
  editTitle: editingTaskTitle,
  editDescription: editingTaskDescription,
  setEditTitle,
  setEditDescription,
  onRefresh: onRefreshTasks,
  onToggle: onToggleTaskCompletion,
  onStartEdit: onStartTaskEdit,
  onSaveEdit: onSaveTaskEdit,
  onCancelEdit: onCancelTaskEdit,
  onDelete: onDeleteTask,
}: TaskListProps) {
  return (
    <div className="md:col-span-2 space-y-4">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          Tasks{' '}
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary/80 text-muted-foreground">
            {taskList.length}
          </span>
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefreshTasks}
          disabled={isTasksLoading}
          className="text-xs font-semibold text-teal-400 hover:text-teal-300 hover:bg-secondary/40 transition-colors gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${isTasksLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isTasksLoading ? (
        <div className="flex flex-col justify-center items-center py-20 space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="text-xs text-muted-foreground">Loading tasks...</span>
        </div>
      ) : taskList.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl text-muted-foreground flex flex-col items-center justify-center space-y-2 bg-secondary/10">
          <p className="text-sm font-medium">No tasks available.</p>
          <p className="text-xs text-muted-foreground/80">Add some tasks on the left to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {taskList.map((currentTask) => (
            <TaskItem
              key={currentTask.id}
              item={currentTask}
              isEditing={editingTask?.id === currentTask.id}
              editTitle={editingTaskTitle}
              editDescription={editingTaskDescription}
              setEditTitle={setEditTitle}
              setEditDescription={setEditDescription}
              onToggle={onToggleTaskCompletion}
              onStartEdit={onStartTaskEdit}
              onSaveEdit={onSaveTaskEdit}
              onCancelEdit={onCancelTaskEdit}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}

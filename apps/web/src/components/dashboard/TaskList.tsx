'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import type { Task } from '@/lib/api';
import { TaskItem } from './TaskItem';

gsap.registerPlugin(useGSAP);

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
  const taskListContainerRef = useRef<HTMLDivElement | null>(null);
  const isInitialMountRef = useRef(true);
  const previousLoadingStateRef = useRef(isTasksLoading);
  const previousTaskIdsRef = useRef<Set<string>>(new Set(taskList.map(t => t.id)));

  useGSAP(
    () => {
      if (!taskListContainerRef.current) return;

      const wasLoadingFinished = previousLoadingStateRef.current && !isTasksLoading;
      const isInitialMountWithItems = isInitialMountRef.current && taskList.length > 0;
      isInitialMountRef.current = false;
      previousLoadingStateRef.current = isTasksLoading;

      const currentTaskIds = new Set(taskList.map(t => t.id));

      // Staggered reveal: ONLY when loading finishes (initial load / refresh) or on initial mount with items
      if ((isInitialMountWithItems || wasLoadingFinished) && taskList.length > 0) {
        const taskCards = taskListContainerRef.current.querySelectorAll('.task-item-card');
        if (taskCards.length > 0) {
          gsap.fromTo(
            taskCards,
            { opacity: 0, y: 14 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.05,
              duration: 0.35,
              ease: 'power2.out',
              clearProps: 'opacity,transform',
            }
          );
        }
      } else {
        // Find tasks that were just added
        const newTasks = taskList.filter(t => !previousTaskIdsRef.current.has(t.id));
        
        if (newTasks.length > 0) {
          const newTaskElements = newTasks
            .map(t => taskListContainerRef.current?.querySelector(`[data-task-id="${t.id}"]`))
            .filter(Boolean);
            
          if (newTaskElements.length > 0) {
            gsap.fromTo(
              newTaskElements,
              { opacity: 0, y: -16, scale: 0.95 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.35,
                ease: 'back.out(1.5)',
                stagger: 0.1,
                clearProps: 'opacity,transform,scale',
              }
            );
          }
        }
      }

      previousTaskIdsRef.current = currentTaskIds;
    },
    { scope: taskListContainerRef, dependencies: [isTasksLoading, taskList] }
  );

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
        <div ref={taskListContainerRef} className="space-y-3">
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

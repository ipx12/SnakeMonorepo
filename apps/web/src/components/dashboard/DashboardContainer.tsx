'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import type { Task, User } from '@/lib/api';
import { useTasks } from '@/hooks/use-tasks';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AuthStatusCard } from '@/components/dashboard/AuthStatusCard';
import { CreateTaskForm } from '@/components/dashboard/CreateTaskForm';
import { TaskList } from '@/components/dashboard/TaskList';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, Lock } from 'lucide-react';

export function DashboardContainer() {
  const { data: session, isPending: isAuthLoading } = useSession();
  const user = session?.user ? (session.user as unknown as User) : null;

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [editingTaskDescription, setEditingTaskDescription] = useState('');

  // Encapsulated React Query logic
  const {
    taskList,
    isTasksLoading,
    errorMessage,
    createTask,
    toggleTaskCompletion,
    updateTask,
    deleteTask,
    refreshTasks,
  } = useTasks({ enabled: !!user });

  const handleCreateTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTask(
      { title: newTaskTitle, description: newTaskDescription },
      {
        onSuccess: () => {
          setNewTaskTitle('');
          setNewTaskDescription('');
        },
      }
    );
  };

  const handleToggleTaskCompletion = (targetTask: Task) => {
    toggleTaskCompletion(targetTask);
  };

  const handleStartTaskEdit = (targetTask: Task) => {
    setEditingTask(targetTask);
    setEditingTaskTitle(targetTask.title);
    setEditingTaskDescription(targetTask.description);
  };

  const handleSaveTaskEdit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingTask || !editingTaskTitle.trim()) return;
    updateTask(
      { id: editingTask.id, title: editingTaskTitle, description: editingTaskDescription },
      {
        onSuccess: () => {
          setEditingTask(null);
        },
      }
    );
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-4xl space-y-10">
        <DashboardHeader />
        <AuthStatusCard user={user} authLoading={isAuthLoading} />

        {errorMessage && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center font-medium animate-in fade-in slide-in-from-top-2 duration-200">
            {errorMessage}
          </div>
        )}

        {isAuthLoading ? (
          <div className="py-20 px-6 border border-border/60 rounded-2xl bg-secondary/10 backdrop-blur-xl flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-200">
            <div className="size-10 animate-spin rounded-full border-3 border-emerald-500 border-t-transparent" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Loading session...</span>
          </div>
        ) : !user ? (
          <div className="py-16 px-6 border border-border/80 rounded-2xl bg-secondary/15 backdrop-blur-xl shadow-xl flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
              <Lock className="size-8" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Please Sign In</h2>
              <p className="text-sm text-muted-foreground">
                To view and manage your personal tasks, you need to sign in to your account.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Link href="/login">
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 cursor-pointer shadow-lg shadow-emerald-500/20">
                  <LogIn className="size-4" /> Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="border-border hover:bg-secondary font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 cursor-pointer">
                  <UserPlus className="size-4 text-emerald-400" /> Register
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <CreateTaskForm
              title={newTaskTitle}
              description={newTaskDescription}
              setTitle={setNewTaskTitle}
              setDescription={setNewTaskDescription}
              onSubmit={handleCreateTask}
            />
            <TaskList
              items={taskList}
              loading={isTasksLoading}
              editingItem={editingTask}
              editTitle={editingTaskTitle}
              editDescription={editingTaskDescription}
              setEditTitle={setEditingTaskTitle}
              setEditDescription={setEditingTaskDescription}
              onRefresh={refreshTasks}
              onToggle={handleToggleTaskCompletion}
              onStartEdit={handleStartTaskEdit}
              onSaveEdit={handleSaveTaskEdit}
              onCancelEdit={() => setEditingTask(null)}
              onDelete={handleDeleteTask}
            />
          </div>
        )}
      </div>
    </div>
  );
}

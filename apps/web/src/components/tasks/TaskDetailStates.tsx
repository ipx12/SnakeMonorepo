'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Lock, LogIn, UserPlus } from 'lucide-react';

/**
 * Top back navigation bar returning the user to the main dashboard.
 */
export function TaskDetailBackNav() {
  return (
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
  );
}

export interface TaskDetailLoadingStateProps {
  /** Label displayed beneath the loading spinner */
  label: string;
}

/**
 * Glassmorphic loading spinner panel for session or task data loading states.
 */
export function TaskDetailLoadingState({ label }: TaskDetailLoadingStateProps) {
  return (
    <div className="py-20 px-6 border border-border/60 rounded-2xl bg-secondary/10 backdrop-blur-xl flex flex-col items-center justify-center space-y-4">
      <div className="size-10 animate-spin rounded-full border-3 border-emerald-500 border-t-transparent" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

/**
 * Unauthenticated state card prompting the user to sign in or register.
 */
export function TaskDetailSignInCard() {
  return (
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
  );
}

export interface TaskDetailErrorCardProps {
  /** Optional specific error reason from the server or query */
  errorMessage?: string;
}

/**
 * Error card displayed when a task is not found (404), forbidden (403), or fails to load.
 */
export function TaskDetailErrorCard({ errorMessage }: TaskDetailErrorCardProps) {
  return (
    <div className="py-16 px-6 border border-destructive/30 rounded-2xl bg-destructive/5 backdrop-blur-xl shadow-xl flex flex-col items-center text-center space-y-5">
      <div className="size-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
        <AlertCircle className="size-8" />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Task Unavailable</h2>
        <p className="text-sm text-muted-foreground">
          {errorMessage ||
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
  );
}


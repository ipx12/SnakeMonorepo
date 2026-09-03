import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, ShieldCheck, User as UserIcon, Crown, UserCheck, Users } from 'lucide-react';
import type { User } from '@/lib/api';
import { UserRole } from '@snake/types';

interface AuthStatusCardProps {
  user: User | null;
  authLoading: boolean;
}

export function AuthStatusCard({ user, authLoading }: AuthStatusCardProps) {
  const getRoleBadge = (userRole?: string) => {
    if (userRole === UserRole.Admin) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-[11px] font-bold border border-purple-500/30 uppercase tracking-wider shrink-0">
          <Crown className="size-3 text-amber-400" /> Admin
        </span>
      );
    }
    if (userRole === UserRole.User) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 uppercase tracking-wider shrink-0">
          <UserCheck className="size-3 text-emerald-400" /> User
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-bold border border-amber-500/30 uppercase tracking-wider shrink-0">
        <UserIcon className="size-3 text-amber-400" /> Guest
      </span>
    );
  };

  const hasActionButtons = Boolean(user?.role === UserRole.Admin || (!user && !authLoading));

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-secondary/25 border border-border/80 backdrop-blur-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 sm:gap-4 shadow-lg">
      {!authLoading && user ? (
        <div className="flex items-center sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="size-11 sm:size-12 shrink-0 rounded-full bg-linear-to-tr from-emerald-500 via-teal-500 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <h3 className="font-bold text-foreground text-sm tracking-tight truncate">{user.name}</h3>
              <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
                {getRoleBadge(user.role)}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20 shrink-0">
                  <ShieldCheck className="size-3" /> Logged In
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <div className="flex sm:hidden items-center gap-1.5 flex-wrap pt-0.5">
              {getRoleBadge(user.role)}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20 shrink-0">
                <ShieldCheck className="size-3" /> Logged In
              </span>
            </div>
          </div>
        </div>
      ) : !authLoading ? (
        <div className="flex items-center sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="size-11 sm:size-12 shrink-0 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground shrink-0 shadow-sm">
            <UserIcon className="size-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <h3 className="font-bold text-foreground text-sm tracking-tight">Guest Visitor</h3>
              <div className="hidden sm:block">{getRoleBadge('guest')}</div>
            </div>
            <p className="text-xs text-muted-foreground truncate">Sign in or register to manage your personal tasks</p>
            <div className="flex sm:hidden items-center pt-0.5">
              {getRoleBadge('guest')}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
          <div className="size-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span>Checking session status...</span>
        </div>
      )}

      {hasActionButtons && (
        <div className="w-full sm:w-auto flex items-center gap-2 shrink-0 pt-2.5 sm:pt-0 border-t border-border/40 sm:border-t-0">
          {user?.role === UserRole.Admin && (
            <Link href="/admin/users" className="w-full sm:w-auto">
              <Button
                size="sm"
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold gap-1.5 cursor-pointer shadow-lg shadow-purple-500/25 transition-all justify-center"
              >
                <Users className="size-3.5" /> User List
              </Button>
            </Link>
          )}
          {!user && (
            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold gap-1.5 cursor-pointer justify-center">
                  <LogIn className="size-3.5 text-emerald-400" /> Sign In
                </Button>
              </Link>
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="sm" className="w-full bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold gap-1.5 cursor-pointer justify-center">
                  <UserPlus className="size-3.5" /> Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

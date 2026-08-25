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
  const getRoleBadge = (role?: string) => {
    if (role === UserRole.Admin) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-[11px] font-bold border border-purple-500/30 uppercase tracking-wider">
          <Crown className="size-3 text-amber-400" /> Admin
        </span>
      );
    }
    if (role === UserRole.User) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 uppercase tracking-wider">
          <UserCheck className="size-3 text-emerald-400" /> User
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-bold border border-amber-500/30 uppercase tracking-wider">
        <UserIcon className="size-3 text-amber-400" /> Guest
      </span>
    );
  };

  return (
    <div className="p-5 rounded-2xl bg-secondary/25 border border-border/80 backdrop-blur-lg flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
      {!authLoading && user ? (
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-full bg-linear-to-tr from-emerald-500 via-teal-500 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-foreground text-sm">{user.name}</h3>
              {getRoleBadge(user.role)}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                <ShieldCheck className="size-3" /> Logged In
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ) : !authLoading ? (
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground">
            <UserIcon className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground text-sm">Guest Visitor</h3>
              {getRoleBadge('guest')}
            </div>
            <p className="text-xs text-muted-foreground">Sign in or register to manage your personal task dashboard</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="size-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span>Checking session status...</span>
        </div>
      )}

      <div className="flex items-center gap-2.5 shrink-0">
        {user?.role === UserRole.Admin && (
          <Link href="/admin/users">
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold gap-1.5 cursor-pointer shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
            >
              <Users className="size-3.5" /> User List
            </Button>
          </Link>
        )}
        {!user && (
          <>
            <Link href="/login">
              <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 cursor-pointer">
                <LogIn className="size-3.5 text-emerald-400" /> Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold gap-1.5 cursor-pointer">
                <UserPlus className="size-3.5" /> Register
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

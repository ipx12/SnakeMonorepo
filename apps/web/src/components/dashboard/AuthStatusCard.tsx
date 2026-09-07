'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, ShieldCheck, User as UserIcon, Crown, UserCheck, Users } from 'lucide-react';
import type { User } from '@/lib/api';
import { UserRole } from '@snake/types';

gsap.registerPlugin(useGSAP);

interface AuthStatusCardProps {
  user: User | null;
  authLoading: boolean;
}

export function AuthStatusCard({ user, authLoading }: AuthStatusCardProps) {
  const cardContainerRef = useRef<HTMLDivElement | null>(null);
  const spotlightElementRef = useRef<HTMLDivElement | null>(null);
  const avatarPulseRef = useRef<HTMLDivElement | null>(null);

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

  const { contextSafe } = useGSAP(
    () => {
      // Gentle breathing pulse around avatar for authenticated session
      if (avatarPulseRef.current) {
        gsap.to(avatarPulseRef.current, {
          scale: 1.25,
          opacity: 0,
          duration: 2.2,
          repeat: -1,
          ease: 'power2.out',
        });
      }
    },
    { scope: cardContainerRef, dependencies: [user?.id] }
  );

  // Smooth cursor spotlight: card remains 100% physically stationary so buttons never shift
  const handleCardMouseMove = contextSafe((mouseEvent: React.MouseEvent<HTMLDivElement>) => {
    if (!cardContainerRef.current || !spotlightElementRef.current) return;

    const cardBoundingRect = cardContainerRef.current.getBoundingClientRect();
    const cursorOffsetX = mouseEvent.clientX - cardBoundingRect.left;
    const cursorOffsetY = mouseEvent.clientY - cardBoundingRect.top;

    spotlightElementRef.current.style.setProperty('--spotlight-x', `${cursorOffsetX}px`);
    spotlightElementRef.current.style.setProperty('--spotlight-y', `${cursorOffsetY}px`);

    gsap.to(spotlightElementRef.current, {
      opacity: 1,
      duration: 0.2,
      overwrite: 'auto',
    });
  });

  const handleCardMouseLeave = contextSafe(() => {
    if (!spotlightElementRef.current) return;

    gsap.to(spotlightElementRef.current, {
      opacity: 0,
      duration: 0.4,
      overwrite: 'auto',
    });
  });

  return (
    <div
      ref={cardContainerRef}
      onMouseMove={handleCardMouseMove}
      onMouseLeave={handleCardMouseLeave}
      className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-secondary/25 border border-border/80 backdrop-blur-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 sm:gap-4 shadow-lg transition-colors duration-200"
    >
      {/* Ambient cursor spotlight: purely visual background glow, buttons stay 100% stationary */}
      <div
        ref={spotlightElementRef}
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 z-0"
        style={{
          background:
            'radial-gradient(320px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(16, 185, 129, 0.08), rgba(99, 102, 241, 0.04) 45%, transparent 75%)',
        }}
      />

      {!authLoading && user ? (
        <div className="flex items-center sm:items-center gap-3.5 min-w-0 flex-1 relative z-10">
          <div className="relative size-11 sm:size-12 shrink-0">
            <div
              ref={avatarPulseRef}
              className="absolute inset-0 rounded-full bg-emerald-500/30 -z-10 pointer-events-none"
            />
            <div className="size-full rounded-full bg-linear-to-tr from-emerald-500 via-teal-500 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
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
        <div className="flex items-center sm:items-center gap-3.5 min-w-0 flex-1 relative z-10">
          <div className="size-11 sm:size-12 shrink-0 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground shrink-0 shadow-sm">
            <UserIcon className="size-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <h3 className="font-bold text-foreground text-sm tracking-tight">Guest Visitor</h3>
              <div className="hidden sm:block">{getRoleBadge('guest')}</div>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              Sign in or register to manage your personal tasks
            </p>
            <div className="flex sm:hidden items-center pt-0.5">{getRoleBadge('guest')}</div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-1 relative z-10">
          <div className="size-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span>Checking session status...</span>
        </div>
      )}

      {hasActionButtons && (
        <div className="w-full sm:w-auto flex items-center gap-2 shrink-0 pt-2.5 sm:pt-0 border-t border-border/40 sm:border-t-0 relative z-10">
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
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-semibold gap-1.5 cursor-pointer justify-center hover:bg-secondary/60 hover:text-emerald-400 transition-colors"
                >
                  <LogIn className="size-3.5 text-emerald-400" /> Sign In
                </Button>
              </Link>
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="sm"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold gap-1.5 cursor-pointer justify-center shadow-lg shadow-emerald-500/20 transition-all"
                >
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

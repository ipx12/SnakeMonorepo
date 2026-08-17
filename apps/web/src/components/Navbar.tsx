'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { UserRole } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { LogOut, LogIn, UserPlus, LayoutDashboard, Sparkles, Users } from 'lucide-react';

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand logo */}
        <Link href="/" className="flex items-center gap-2.5 group transition-transform active:scale-95">
          <div className="size-9 rounded-xl bg-linear-to-br from-emerald-400 via-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-all">
            <Sparkles className="size-5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight bg-linear-to-r from-emerald-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
              Watermelon UI
            </span>
            <span className="text-[10px] text-muted-foreground -mt-1 font-medium tracking-wider uppercase">
              Monorepo Suite
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
              pathname === '/'
                ? 'bg-secondary text-emerald-400'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <LayoutDashboard className="size-4" />
            <span>Dashboard</span>
          </Link>

          {user?.role === UserRole.Admin && (
            <Link
              href="/admin/users"
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
                pathname === '/admin/users'
                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                  : 'text-muted-foreground hover:text-purple-300 hover:bg-purple-500/10'
              }`}
            >
              <Users className="size-4 text-purple-400" />
              <span>Users</span>
            </Link>
          )}

          {!loading && user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-border/80">
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1 rounded-full bg-secondary/40 border border-border/50">
                <div className="size-6 rounded-full bg-linear-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold leading-tight text-foreground truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                    {user.email}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors gap-1.5 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : !loading ? (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant={pathname === '/login' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="text-xs sm:text-sm font-medium gap-1.5 cursor-pointer"
                >
                  <LogIn className="size-4 text-emerald-400" />
                  <span>Login</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs sm:text-sm font-medium gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  <UserPlus className="size-4" />
                  <span>Register</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="size-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          )}
        </nav>
      </div>
    </header>
  );
}

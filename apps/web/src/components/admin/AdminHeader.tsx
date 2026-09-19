import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft, RefreshCw } from 'lucide-react';

export interface AdminHeaderProps {
  isFetching: boolean;
  onRefresh: () => void;
}

export function AdminHeader({ isFetching, onRefresh }: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4 mr-1" /> Home
            </Button>
          </Link>
          <span className="text-xs text-muted-foreground">/</span>
          <span className="text-xs font-semibold text-purple-400">Admin Panel</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-purple-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3">
          <Users className="size-8 text-purple-400" /> All System Users
        </h1>
        <p className="text-sm text-muted-foreground">
          A complete list of registered accounts with server-side search, pagination, and detailed user metrics
        </p>
      </div>

      <Button
        onClick={onRefresh}
        disabled={isFetching}
        variant="outline"
        size="sm"
        className="border-purple-500/30 hover:bg-purple-500/10 text-purple-300 text-xs font-semibold gap-2 self-start sm:self-auto cursor-pointer"
      >
        <RefreshCw className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} /> Refresh List
      </Button>
    </div>
  );
}

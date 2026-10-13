import { Users, Crown, UserCheck } from 'lucide-react';

export interface AdminStatsGridProps {
  totalUsers: number;
  adminCount: number;
  regularCount: number;
}

export function AdminStatsGrid({ totalUsers, adminCount, regularCount }: AdminStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl bg-secondary/20 border border-border/80 flex items-center gap-4 shadow-sm">
        <div className="size-11 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
          <Users className="size-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Total Registered</p>
          <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-secondary/20 border border-border/80 flex items-center gap-4 shadow-sm">
        <div className="size-11 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Crown className="size-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Admins on Page</p>
          <p className="text-2xl font-bold text-amber-300">{adminCount}</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-secondary/20 border border-border/80 flex items-center gap-4 shadow-sm">
        <div className="size-11 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <UserCheck className="size-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Users on Page</p>
          <p className="text-2xl font-bold text-emerald-300">{regularCount}</p>
        </div>
      </div>
    </div>
  );
}

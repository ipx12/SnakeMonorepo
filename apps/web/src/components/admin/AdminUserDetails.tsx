import { Button } from '@/components/ui/button';
import { Key, Copy } from 'lucide-react';
import type { AdminUserDetail } from '@snake/types';

export interface AdminUserDetailsProps {
  user: AdminUserDetail;
  onCopy: (textToCopy: string, label: string) => void;
}

export function AdminUserDetails({ user, onCopy }: AdminUserDetailsProps) {
  return (
    <div className="space-y-4 bg-background/60 p-3 sm:p-4 rounded-xl border border-border/70 max-w-full overflow-hidden">
      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
        <Key className="size-4" /> User Object Data
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 space-y-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground block text-[11px]">ID (Primary Key):</span>
            <button
              type="button"
              onClick={() => onCopy(user.id, 'User ID')}
              className="text-[10px] text-purple-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Copy className="size-2.5" /> Copy
            </button>
          </div>
          <span className="font-mono text-foreground font-semibold break-all select-all">{user.id}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 space-y-1 overflow-hidden">
          <span className="text-muted-foreground block text-[11px]">Full Name:</span>
          <span className="text-foreground font-semibold break-words">{user.name}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 space-y-1 overflow-hidden">
          <span className="text-muted-foreground block text-[11px]">Email Address:</span>
          <span className="text-foreground font-semibold break-all">{user.email}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 space-y-1">
          <span className="text-muted-foreground block text-[11px]">Assigned Role:</span>
          <span className="text-purple-300 font-semibold">{user.role}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 space-y-1">
          <span className="text-muted-foreground block text-[11px]">Registration Date:</span>
          <span className="text-foreground font-semibold">{user.createdAt}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 space-y-1">
          <span className="text-muted-foreground block text-[11px]">Last Updated:</span>
          <span className="text-foreground font-semibold">{user.updatedAt}</span>
        </div>
      </div>
      <div className="space-y-1 pt-1 max-w-full">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground font-semibold">RAW JSON output:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(JSON.stringify(user, null, 2), 'User JSON')}
            className="h-6 text-[11px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1 px-2 cursor-pointer"
          >
            <Copy className="size-3" /> Copy JSON
          </Button>
        </div>
        <pre className="p-3 rounded-lg bg-black/40 border border-border/50 text-[11px] font-mono text-emerald-400 overflow-x-auto max-w-full whitespace-pre">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
}

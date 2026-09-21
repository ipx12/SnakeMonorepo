import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Crown,
  UserCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  Info,
  ChevronDown,
  ChevronUp,
  Copy,
} from 'lucide-react';
import { UserRole, type AdminUserDetail } from '@snake/types';
import { AdminUserDetails } from './AdminUserDetails';

export interface AdminUserRowProps {
  user: AdminUserDetail;
  isExpanded: boolean;
  onToggleExpand: (userId: string) => void;
  onCopy: (textToCopy: string, label: string) => void;
}

export function AdminUserRow({
  user,
  isExpanded,
  onToggleExpand,
  onCopy,
}: AdminUserRowProps) {
  const createdDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <React.Fragment>
      <TableRow className="hover:bg-secondary/30 transition-colors border-border/50">
        <TableCell className="py-3">
          <div className="flex items-center gap-3">
            <div className="size-8 sm:size-9 rounded-full bg-linear-to-tr from-purple-500 via-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs shadow">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-sm">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        </TableCell>

        <TableCell className="py-3">
          <button
            type="button"
            onClick={() => onCopy(user.id, 'User ID')}
            title="Click to copy User ID"
            className="font-mono text-xs text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-2 py-1 rounded border border-purple-500/20 inline-flex items-center gap-1.5 transition-colors cursor-pointer group/copy"
          >
            <span>{user.id}</span>
            <Copy className="size-3 opacity-60 group-hover/copy:opacity-100 transition-opacity" />
          </button>
        </TableCell>

        <TableCell className="py-3">
          {user.role === UserRole.Admin ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-[11px] font-bold border border-purple-500/30 uppercase tracking-wider">
              <Crown className="size-3 text-amber-400" /> Admin
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 uppercase tracking-wider">
              <UserCheck className="size-3 text-emerald-400" /> User
            </span>
          )}
        </TableCell>

        <TableCell className="py-3">
          {user.emailVerified ? (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="size-4" /> Yes
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <XCircle className="size-4 text-muted-foreground/60" /> No
            </span>
          )}
        </TableCell>

        <TableCell className="py-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5 text-muted-foreground/70" /> {createdDate}
          </span>
        </TableCell>

        <TableCell className="py-3 text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpand(user.id)}
            className="h-8 text-xs gap-1 text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 cursor-pointer"
          >
            <Info className="size-3.5" />
            <span>{isExpanded ? 'Hide' : 'Full Info'}</span>
            {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </Button>
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className="bg-secondary/20 border-b border-border/60 hover:bg-secondary/20">
          <TableCell colSpan={6} className="p-3 sm:p-6 max-w-full whitespace-normal">
            <AdminUserDetails user={user} onCopy={onCopy} />
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}

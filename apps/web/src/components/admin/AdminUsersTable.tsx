import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AdminUserDetail } from '@snake/types';
import { AdminUserRow } from './AdminUserRow';

export interface AdminUsersTableProps {
  usersList: AdminUserDetail[];
  isUsersLoading: boolean;
  debouncedSearchQuery: string;
  expandedUserId: string | null;
  onToggleExpand: (userId: string) => void;
  onCopy: (textToCopy: string, label: string) => void;
}

export function AdminUsersTable({
  usersList,
  isUsersLoading,
  debouncedSearchQuery,
  expandedUserId,
  onToggleExpand,
  onCopy,
}: AdminUsersTableProps) {
  return (
    <Table className="min-w-[640px]">
      <TableHeader className="bg-secondary/40">
        <TableRow className="border-border/60 hover:bg-transparent">
          <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">User</TableHead>
          <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Account ID</TableHead>
          <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Role</TableHead>
          <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Email Verified</TableHead>
          <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Created At</TableHead>
          <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3 text-right">Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-border/50">
        {usersList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="py-12 text-center text-muted-foreground text-sm">
              {isUsersLoading
                ? 'Loading users...'
                : debouncedSearchQuery
                ? 'No users found matching your query'
                : 'No users found'}
            </TableCell>
          </TableRow>
        ) : (
          usersList.map((userItem) => (
            <AdminUserRow
              key={userItem.id}
              user={userItem}
              isExpanded={expandedUserId === userItem.id}
              onToggleExpand={onToggleExpand}
              onCopy={onCopy}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
}

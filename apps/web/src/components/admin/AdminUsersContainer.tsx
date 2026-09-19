'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { UserRole } from '@snake/types';
import { toast } from '@/components/ui/sonner';
import { useAdminUsers } from '@/hooks/use-admin-users';
import { AccessDeniedCard } from './AccessDeniedCard';
import { AdminLoadingSkeleton } from './AdminLoadingSkeleton';
import { AdminHeader } from './AdminHeader';
import { AdminStatsGrid } from './AdminStatsGrid';
import { AdminUsersToolbar } from './AdminUsersToolbar';
import { AdminUsersTable } from './AdminUsersTable';
import { AdminPagination } from './AdminPagination';

export interface AdminUsersContainerProps {
  initialUser?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  } | null;
}

export function AdminUsersContainer({ initialUser }: AdminUsersContainerProps = {}) {
  const { data: session, isPending: isAuthLoading } = useSession();
  const user = initialUser || session?.user;
  const isAuthorizedAdmin = !!user && (user as { role?: string }).role === UserRole.Admin;

  const {
    currentPage,
    pageSize,
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    usersList,
    paginationMeta,
    isUsersLoading,
    isFetching,
    errorMessage,
    refetch,
    handlePageChange,
    handlePageSizeChange,
    totalUsers,
    adminCount,
    regularCount,
  } = useAdminUsers({ enabled: isAuthorizedAdmin });

  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const handleCopyToClipboard = async (textToCopy: string, label: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleToggleExpandUser = (targetUserId: string) => {
    setExpandedUserId((currentExpandedId) =>
      currentExpandedId === targetUserId ? null : targetUserId
    );
  };

  if (!initialUser && isAuthLoading) {
    return <AdminLoadingSkeleton />;
  }

  if (!user || (user as { role?: string }).role !== UserRole.Admin) {
    return <AccessDeniedCard />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-6xl space-y-8">
        <AdminHeader isFetching={isFetching} onRefresh={refetch} />

        <AdminStatsGrid
          totalUsers={totalUsers}
          adminCount={adminCount}
          regularCount={regularCount}
        />

        {errorMessage && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium animate-in fade-in">
            {errorMessage}
          </div>
        )}

        <AdminUsersToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />

        <div className="w-full max-w-full min-w-0 border border-border/80 rounded-2xl bg-secondary/15 backdrop-blur-xl shadow-xl overflow-hidden">
          <AdminUsersTable
            usersList={usersList}
            isUsersLoading={isUsersLoading}
            debouncedSearchQuery={debouncedSearchQuery}
            expandedUserId={expandedUserId}
            onToggleExpand={handleToggleExpandUser}
            onCopy={handleCopyToClipboard}
          />

          <AdminPagination
            currentPage={currentPage}
            totalPages={paginationMeta.totalPages}
            pageSize={pageSize}
            totalRecords={totalUsers}
            isLoading={isUsersLoading}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}

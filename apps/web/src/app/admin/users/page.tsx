import { AdminUsersContainer } from '@/components/admin/AdminUsersContainer';
import { getServerSession } from '@/lib/auth-server';
import { UserRole, adminUserKeys } from '@snake/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { type Metadata } from 'next';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getAdminUsersServer } from '@/lib/api-server';

export const metadata: Metadata = {
  title: 'Admin Users - Watermelon UI',
  description: 'Manage users in the system',
};

const noop = () => {};

export default async function AdminUsersPage() {
  const { user } = await getServerSession();

  if (!user || user.role !== UserRole.Admin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md p-8 border border-destructive/30 rounded-2xl bg-secondary/15 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center space-y-5">
          <div className="size-16 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive">
            <ShieldAlert className="size-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Access Restricted</h2>
            <p className="text-sm text-muted-foreground">
              The admin panel is only accessible to users with the <span className="font-semibold text-purple-400">Admin</span> role.
            </p>
          </div>
          <Link href="/">
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 cursor-pointer shadow-lg shadow-emerald-500/20">
              <ArrowLeft className="size-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const queryClient = new QueryClient();

  await queryClient
    .query({
      queryKey: adminUserKeys.list({ page: 1, limit: 10, search: '' }),
      queryFn: () => getAdminUsersServer({ page: 1, limit: 10, search: '' }),
    })
    .catch(noop);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminUsersContainer initialUser={user} />
    </HydrationBoundary>
  );
}

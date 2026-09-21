import { AdminUsersContainer } from '@/components/admin/AdminUsersContainer';
import { AccessDeniedCard } from '@/components/admin/AccessDeniedCard';
import { getServerSession } from '@/lib/auth-server';
import { UserRole, adminUserKeys } from '@snake/types';
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
    return <AccessDeniedCard />;
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

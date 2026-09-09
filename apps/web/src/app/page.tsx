import { DashboardContainer } from '@/components/dashboard/DashboardContainer';
import { type Metadata } from 'next';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getTasksServer } from '@/lib/api-server';
import { getServerSession } from '@/lib/auth-server';
import { taskKeys } from '@snake/types';

export const metadata: Metadata = {
  title: 'Dashboard - Watermelon UI',
  description: 'Manage your personal tasks',
};

const noop = () => {};

export default async function Home() {
  const { user } = await getServerSession();
  const queryClient = new QueryClient();

  // Only prefetch tasks if user is authenticated, avoiding redundant 401s
  if (user) {
    await queryClient
      .query({
        queryKey: taskKeys.all,
        queryFn: getTasksServer,
      })
      .catch(noop);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContainer />
    </HydrationBoundary>
  );
}

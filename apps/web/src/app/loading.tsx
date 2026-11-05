import { DashboardLoadingSkeleton } from '@/components/dashboard/DashboardLoadingSkeleton';

/**
 * Instant loading UI for the root dashboard route.
 * Automatically wraps page.tsx in a Suspense boundary for streaming and PPR.
 */
export default function Loading() {
  return <DashboardLoadingSkeleton />;
}

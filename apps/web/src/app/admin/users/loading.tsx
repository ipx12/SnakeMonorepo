import { AdminLoadingSkeleton } from '@/components/admin/AdminLoadingSkeleton';

/**
 * Instant loading UI for the /admin/users route segment.
 * Automatically wraps page.tsx in a Suspense boundary for streaming and PPR.
 */
export default function Loading() {
  return <AdminLoadingSkeleton />;
}

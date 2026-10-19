import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

/**
 * Loading skeleton fallback for Dashboard partial prerendering shell.
 * Styled with Watermelon UI glassmorphism and subtle pulsing animations.
 */
export function DashboardLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-4xl space-y-10">
        <DashboardHeader />

        {/* Auth Status Card Skeleton */}
        <div className="w-full p-6 sm:p-8 rounded-2xl bg-secondary/15 border border-border/60 backdrop-blur-xl shadow-xl animate-pulse">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="size-12 rounded-full bg-secondary/60" />
              <div className="space-y-2">
                <div className="h-4 w-36 bg-secondary/60 rounded" />
                <div className="h-3 w-48 bg-secondary/40 rounded" />
              </div>
            </div>
            <div className="h-9 w-28 bg-secondary/50 rounded-xl" />
          </div>
        </div>

        {/* Task Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Create Task Form Skeleton */}
          <div className="md:col-span-1 p-6 rounded-2xl bg-secondary/10 border border-border/40 backdrop-blur-xl space-y-4 animate-pulse">
            <div className="h-5 w-32 bg-secondary/60 rounded" />
            <div className="h-10 w-full bg-secondary/40 rounded-xl" />
            <div className="h-20 w-full bg-secondary/40 rounded-xl" />
            <div className="h-10 w-full bg-emerald-500/20 rounded-xl" />
          </div>

          {/* Task List Skeleton */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between animate-pulse">
              <div className="h-5 w-24 bg-secondary/60 rounded" />
              <div className="h-8 w-20 bg-secondary/40 rounded-lg" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((skeletonIndex) => (
                <div
                  key={skeletonIndex}
                  className="p-5 rounded-2xl bg-secondary/10 border border-border/40 backdrop-blur-xl space-y-2 animate-pulse"
                >
                  <div className="h-4 w-3/4 bg-secondary/60 rounded" />
                  <div className="h-3 w-1/2 bg-secondary/40 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton fallback for the dynamic task detail route (/tasks/[id]).
 * Styled with Watermelon UI glassmorphism and subtle pulsing animations.
 */
export function TaskDetailLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-3xl space-y-6 animate-pulse">
        {/* Back navigation skeleton */}
        <div className="h-9 w-40 bg-secondary/40 rounded-xl" />

        {/* Main task card skeleton */}
        <div className="p-6 sm:p-8 rounded-2xl bg-secondary/15 border border-border/60 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="h-6 w-28 bg-secondary/50 rounded-full" />
            <div className="h-5 w-44 bg-secondary/40 rounded" />
          </div>

          <div className="space-y-3">
            <div className="h-8 w-3/4 bg-secondary/60 rounded-lg" />
            <div className="h-4 w-1/3 bg-secondary/40 rounded" />
          </div>

          <div className="p-5 rounded-xl bg-secondary/20 border border-border/40 space-y-2.5">
            <div className="h-4 w-full bg-secondary/50 rounded" />
            <div className="h-4 w-5/6 bg-secondary/40 rounded" />
            <div className="h-4 w-2/3 bg-secondary/30 rounded" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/50">
            <div className="h-9 w-36 bg-secondary/50 rounded-xl" />
            <div className="flex gap-2">
              <div className="h-9 w-24 bg-secondary/50 rounded-xl" />
              <div className="h-9 w-24 bg-secondary/40 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


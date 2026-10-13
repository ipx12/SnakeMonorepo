export function AdminLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="py-20 px-8 border border-border/60 rounded-2xl bg-secondary/10 backdrop-blur-xl flex flex-col items-center justify-center space-y-4 shadow-xl">
        <div className="size-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Loading user list...
        </span>
      </div>
    </div>
  );
}

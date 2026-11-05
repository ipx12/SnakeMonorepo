interface AuthRedirectingCardProps {
  /** Headline shown above the redirect notice (e.g. "Login Successful"). */
  title: string;
  /** Tailwind gradient classes for the ambient background glow. */
  glowGradientClassName: string;
}

/**
 * Full-height success card displayed while an auth form redirects to the dashboard.
 *
 * @param props - {@link AuthRedirectingCardProps}
 * @returns The redirecting status card.
 * @example
 * <AuthRedirectingCard title="Login Successful" glowGradientClassName="from-emerald-500/15 via-teal-500/10 to-indigo-500/15" />
 */
export function AuthRedirectingCard({ title, glowGradientClassName }: AuthRedirectingCardProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden font-sans">
      <div
        className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-tr ${glowGradientClassName} blur-3xl rounded-full pointer-events-none -z-10`}
      />
      <div className="p-8 rounded-2xl bg-secondary/25 border border-border/80 backdrop-blur-xl shadow-2xl flex flex-col items-center space-y-4 max-w-sm text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="size-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <div className="size-7 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    </div>
  );
}


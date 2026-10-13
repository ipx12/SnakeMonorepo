export function DashboardHeader() {
  return (
    <div className="text-center relative px-2">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-24 bg-linear-to-r from-emerald-500/20 to-teal-500/20 blur-3xl rounded-full -z-10" />
      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-linear-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
        Task Monorepo Dashboard
      </h1>
      <p className="mt-2 sm:mt-3 text-muted-foreground max-w-lg mx-auto text-xs sm:text-sm md:text-base leading-relaxed">
        A premium Turborepo demonstration featuring a Next.js frontend, Express.js backend, and a modern Watermelon UI system.
      </p>
    </div>
  );
}

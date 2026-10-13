'use client';

import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-secondary/90 group-[.toaster]:text-foreground group-[.toaster]:border-border/80 group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-xl group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:font-sans',
          description: 'group-[.toast]:text-muted-foreground text-xs',
          actionButton:
            'group-[.toast]:bg-emerald-500 group-[.toast]:text-white group-[.toast]:font-medium group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 hover:group-[.toast]:bg-emerald-400 transition-colors',
          cancelButton:
            'group-[.toast]:bg-secondary group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 hover:group-[.toast]:bg-secondary/80 transition-colors',
          error:
            'group-[.toaster]:!border-destructive/40 group-[.toaster]:!bg-destructive/10 group-[.toaster]:!text-destructive',
          success:
            'group-[.toaster]:!border-emerald-500/40 group-[.toaster]:!bg-emerald-500/10 group-[.toaster]:!text-emerald-300',
          info:
            'group-[.toaster]:!border-cyan-500/40 group-[.toaster]:!bg-cyan-500/10 group-[.toaster]:!text-cyan-300',
          warning:
            'group-[.toaster]:!border-amber-500/40 group-[.toaster]:!bg-amber-500/10 group-[.toaster]:!text-amber-300',
        },
      }}
      {...props}
    />
  );
}

export { Toaster, toast };

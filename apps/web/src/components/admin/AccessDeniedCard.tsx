import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function AccessDeniedCard() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md p-8 border border-destructive/30 rounded-2xl bg-secondary/15 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center space-y-5">
        <div className="size-16 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive">
          <ShieldAlert className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Access Restricted</h2>
          <p className="text-sm text-muted-foreground">
            The admin panel is only accessible to users with the <span className="font-semibold text-purple-400">Admin</span> role.
          </p>
        </div>
        <Link href="/">
          <Button className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 cursor-pointer shadow-lg shadow-emerald-500/20">
            <ArrowLeft className="size-4" /> Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

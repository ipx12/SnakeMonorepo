'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/AuthContext';
import { loginSchema, LoginFormData } from '@/lib/schemas/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Mail, Eye, EyeOff, LogIn, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await login({ email: data.email, password: data.password });
      setSuccessMsg('Authorization successful!');
      setIsRedirecting(true);
      router.push('/');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setValue('email', 'demo@watermelon.ui', { shouldValidate: true });
    setValue('password', 'password123', { shouldValidate: true });
  };

  if (isRedirecting) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden font-sans">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-indigo-500/15 blur-3xl rounded-full pointer-events-none -z-10" />
        <div className="p-8 rounded-2xl bg-secondary/25 border border-border/80 backdrop-blur-xl shadow-2xl flex flex-col items-center space-y-4 max-w-sm text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="size-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <div className="size-7 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-foreground">Успешная авторизация</h3>
            <p className="text-xs text-muted-foreground">Переходим к вашим задачам...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background radial glowing effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-indigo-500/15 blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="size-3.5" /> Authorization Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your Watermelon UI dashboard
          </p>
        </div>

        {/* Demo Account Banner */}
        <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/80 text-xs flex items-center justify-between gap-3 backdrop-blur-sm">
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">Demo Credentials:</span>
            <span className="text-muted-foreground">demo@watermelon.ui / password123</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFillDemo}
            className="text-[11px] h-7 px-2.5 bg-background/60 hover:bg-emerald-500/10 hover:text-emerald-400 border-border cursor-pointer transition-colors"
          >
            Auto Fill
          </Button>
        </div>

        {/* Form Card */}
        <div className="bg-secondary/20 border border-border/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5">
          {serverError && (
            <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="size-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="email"
                  {...register('email')}
                  placeholder="name@example.com"
                  className="pl-10 bg-background/60 border-border/80 focus-visible:ring-emerald-500/30"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-destructive font-medium mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-background/60 border-border/80 focus-visible:ring-emerald-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-destructive font-medium mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-primary-foreground font-semibold py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-[0.98] gap-2"
            >
              {loading ? (
                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="size-4" />
                  <span>Sign In</span>
                </>
              )}
            </Button>
          </form>

          {/* Footer switch to Register */}
          <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border/40">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors"
            >
              Create User Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

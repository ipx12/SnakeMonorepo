'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/AuthContext';
import { registerSchema, RegisterFormData } from '@/lib/schemas/auth';
import { UserRole } from '@snake/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Mail, User as UserIcon, Eye, EyeOff, UserPlus, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerAuth } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.User,
    },
  });

  const selectedRole = useWatch({ control, name: 'role' });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await registerAuth({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      setSuccessMsg('Account created successfully!');
      setIsRedirecting(true);
      router.push('/');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Failed to register. Please try again.');
      setLoading(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden font-sans">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-tr from-teal-500/15 via-emerald-500/10 to-indigo-500/15 blur-3xl rounded-full pointer-events-none -z-10" />
        <div className="p-8 rounded-2xl bg-secondary/25 border border-border/80 backdrop-blur-xl shadow-2xl flex flex-col items-center space-y-4 max-w-sm text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="size-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <div className="size-7 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-foreground">Account Created!</h3>
            <p className="text-xs text-muted-foreground">Redirecting to your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background radial glowing effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-tr from-teal-500/15 via-emerald-500/10 to-indigo-500/15 blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="size-3.5" /> User Creation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-linear-to-r from-emerald-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
            Create New Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Join Watermelon UI to manage tasks and features
          </p>
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
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  {...register('name')}
                  placeholder="John Doe"
                  className="pl-10 bg-background/60 border-border/80 focus-visible:ring-teal-500/30"
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-destructive font-medium mt-1">{errors.name.message}</p>
              )}
            </div>

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
                  className="pl-10 bg-background/60 border-border/80 focus-visible:ring-teal-500/30"
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
                  className="pl-10 pr-10 bg-background/60 border-border/80 focus-visible:ring-teal-500/30"
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

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-background/60 border-border/80 focus-visible:ring-teal-500/30"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-destructive font-medium mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setValue('role', UserRole.User)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedRole === UserRole.User
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm'
                      : 'bg-background/40 border-border/70 text-muted-foreground hover:bg-background/70'
                  }`}
                >
                  <UserIcon className="size-3.5" /> User
                </button>
                <button
                  type="button"
                  onClick={() => setValue('role', UserRole.Admin)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedRole === UserRole.Admin
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-sm'
                      : 'bg-background/40 border-border/70 text-muted-foreground hover:bg-background/70'
                  }`}
                >
                  <Sparkles className="size-3.5 text-amber-400" /> Admin
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-linear-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:from-emerald-400 hover:to-teal-500 text-primary-foreground font-semibold py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-teal-500/20 active:scale-[0.98] gap-2"
            >
              {loading ? (
                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="size-4" />
                  <span>Register Account</span>
                </>
              )}
            </Button>
          </form>

          {/* Footer switch to Login */}
          <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border/40">
            Already registered?{' '}
            <Link
              href="/login"
              className="font-semibold text-teal-300 hover:text-teal-200 underline underline-offset-4 transition-colors"
            >
              Sign In to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

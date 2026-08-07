'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { getAdminUsers, type AdminUserDetail } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Search,
  RefreshCw,
  Crown,
  UserCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  Key,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const [usersList, setUsersList] = useState<AdminUserDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminUsers();
      setUsersList(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить список пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (user?.role === 'admin') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.id.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const totalUsers = usersList.length;
  const adminCount = usersList.filter((u) => u.role === 'admin').length;
  const regularCount = usersList.filter((u) => u.role === 'user').length;

  if (authLoading || (loading && usersList.length === 0)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <div className="py-20 px-8 border border-border/60 rounded-2xl bg-secondary/10 backdrop-blur-xl flex flex-col items-center justify-center space-y-4 shadow-xl">
          <div className="size-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Загрузка списка пользователей...
          </span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md p-8 border border-destructive/30 rounded-2xl bg-secondary/15 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center space-y-5">
          <div className="size-16 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive">
            <ShieldAlert className="size-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Доступ ограничен</h2>
            <p className="text-sm text-muted-foreground">
              Страница панели администратора доступна только пользователям с ролью <span className="font-semibold text-purple-400">Admin</span>.
            </p>
          </div>
          <Link href="/">
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 cursor-pointer shadow-lg shadow-emerald-500/20">
              <ArrowLeft className="size-4" /> Вернуться на главную
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="size-4 mr-1" /> Главная
                </Button>
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-purple-400">Панель администратора</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3">
              <Users className="size-8 text-purple-400" /> Все пользователи системы
            </h1>
            <p className="text-sm text-muted-foreground">
              Полный список зарегистрированных аккаунтов в приложении с подробной информацией
            </p>
          </div>

          <Button
            onClick={fetchUsers}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-purple-500/30 hover:bg-purple-500/10 text-purple-300 text-xs font-semibold gap-2 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} /> Обновить список
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-secondary/20 border border-border/80 flex items-center gap-4 shadow-sm">
            <div className="size-11 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Всего пользователей</p>
              <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/20 border border-border/80 flex items-center gap-4 shadow-sm">
            <div className="size-11 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crown className="size-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Администраторов</p>
              <p className="text-2xl font-bold text-amber-300">{adminCount}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/20 border border-border/80 flex items-center gap-4 shadow-sm">
            <div className="size-11 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserCheck className="size-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Обычных пользователей</p>
              <p className="text-2xl font-bold text-emerald-300">{regularCount}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium animate-in fade-in">
            {error}
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Поиск по имени, email, ID или роли..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary/30 border-border/80 text-sm focus-visible:ring-purple-500"
            />
          </div>
        </div>

        {/* Users Table / List */}
        <div className="border border-border/80 rounded-2xl bg-secondary/15 backdrop-blur-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/40 text-xs font-semibold text-muted-foreground uppercase border-b border-border/60">
                <tr>
                  <th className="py-3.5 px-4">Пользователь</th>
                  <th className="py-3.5 px-4">ID Аккаунта</th>
                  <th className="py-3.5 px-4">Роль</th>
                  <th className="py-3.5 px-4">Email подтверждён</th>
                  <th className="py-3.5 px-4">Дата создания</th>
                  <th className="py-3.5 px-4 text-right">Детали</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground text-sm">
                      {searchQuery ? 'Пользователи не найдены по запросу' : 'Список пользователей пуст'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isExpanded = expandedUserId === u.id;
                    const createdDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : '—';

                    return (
                      <React.Fragment key={u.id}>
                        <tr className="hover:bg-secondary/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs shadow">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-foreground text-sm">{u.name}</span>
                                <span className="text-xs text-muted-foreground">{u.email}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-mono text-xs text-purple-300 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 select-all">
                              {u.id}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {u.role === 'admin' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-[11px] font-bold border border-purple-500/30 uppercase tracking-wider">
                                <Crown className="size-3 text-amber-400" /> Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 uppercase tracking-wider">
                                <UserCheck className="size-3 text-emerald-400" /> User
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {u.emailVerified ? (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                                <CheckCircle2 className="size-4" /> Да
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                                <XCircle className="size-4 text-muted-foreground/60" /> Нет
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3.5 text-muted-foreground/70" /> {createdDate}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                              className="h-8 text-xs gap-1 text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 cursor-pointer"
                            >
                              <Info className="size-3.5" />
                              <span>{isExpanded ? 'Скрыть' : 'Вся инфо'}</span>
                              {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                            </Button>
                          </td>
                        </tr>

                        {/* Expanded details view */}
                        {isExpanded && (
                          <tr className="bg-secondary/20 border-b border-border/60">
                            <td colSpan={6} className="p-4 sm:p-6">
                              <div className="space-y-4 bg-background/60 p-4 rounded-xl border border-border/70">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                                  <Key className="size-4" /> Данные объекта пользователя в системе
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                                  <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 space-y-1">
                                    <span className="text-muted-foreground block text-[11px]">ID (Первичный ключ):</span>
                                    <span className="font-mono text-foreground font-semibold select-all">{u.id}</span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 space-y-1">
                                    <span className="text-muted-foreground block text-[11px]">Полное имя:</span>
                                    <span className="text-foreground font-semibold">{u.name}</span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 space-y-1">
                                    <span className="text-muted-foreground block text-[11px]">Email адрес:</span>
                                    <span className="text-foreground font-semibold">{u.email}</span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 space-y-1">
                                    <span className="text-muted-foreground block text-[11px]">Назначенная роль:</span>
                                    <span className="text-purple-300 font-semibold">{u.role}</span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 space-y-1">
                                    <span className="text-muted-foreground block text-[11px]">Дата регистрации:</span>
                                    <span className="text-foreground font-semibold">{u.createdAt}</span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 space-y-1">
                                    <span className="text-muted-foreground block text-[11px]">Последнее обновление:</span>
                                    <span className="text-foreground font-semibold">{u.updatedAt}</span>
                                  </div>
                                </div>
                                <div className="space-y-1 pt-1">
                                  <span className="text-[11px] text-muted-foreground font-semibold">RAW JSON output:</span>
                                  <pre className="p-3 rounded-lg bg-black/40 border border-border/50 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                                    {JSON.stringify(u, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

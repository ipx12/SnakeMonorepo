'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { getAdminUsers, type AdminUserDetail } from '@/lib/api';
import { UserRole } from '@/lib/roles';
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
  const { user, loading: isAuthLoading } = useAuth();
  const [usersList, setUsersList] = useState<AdminUserDetail[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsUsersLoading(true);
      setErrorMessage('');
      const fetchedUsers = await getAdminUsers();
      setUsersList(fetchedUsers);
    } catch (caughtError: unknown) {
      setErrorMessage(caughtError instanceof Error ? caughtError.message : 'Failed to load the user list');
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (user?.role === UserRole.Admin) {
      fetchUsers();
    } else {
      setIsUsersLoading(false);
    }
  }, [user, isAuthLoading]);

  const filteredUsers = usersList.filter((userItem) => {
    const searchQueryText = searchQuery.toLowerCase().trim();
    if (!searchQueryText) return true;
    return (
      userItem.id.toLowerCase().includes(searchQueryText) ||
      userItem.name.toLowerCase().includes(searchQueryText) ||
      userItem.email.toLowerCase().includes(searchQueryText) ||
      userItem.role.toLowerCase().includes(searchQueryText)
    );
  });

  const totalUsers = usersList.length;
  const adminCount = usersList.filter((userItem) => userItem.role === UserRole.Admin).length;
  const regularCount = usersList.filter((userItem) => userItem.role === UserRole.User).length;

  if (isAuthLoading || (isUsersLoading && usersList.length === 0)) {
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

  if (!user || user.role !== UserRole.Admin) {
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="size-4 mr-1" /> Home
                </Button>
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-purple-400">Admin Panel</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3">
              <Users className="size-8 text-purple-400" /> All System Users
            </h1>
            <p className="text-sm text-muted-foreground">
              A complete list of all registered accounts in the application with detailed information
            </p>
          </div>

          <Button
            onClick={fetchUsers}
            disabled={isUsersLoading}
            variant="outline"
            size="sm"
            className="border-purple-500/30 hover:bg-purple-500/10 text-purple-300 text-xs font-semibold gap-2 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${isUsersLoading ? 'animate-spin' : ''}`} /> Refresh List
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-secondary/20 border border-border/80 flex items-center gap-4 shadow-sm">
            <div className="size-11 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Users</p>
              <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/20 border border-border/80 flex items-center gap-4 shadow-sm">
            <div className="size-11 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crown className="size-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Admins</p>
              <p className="text-2xl font-bold text-amber-300">{adminCount}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/20 border border-border/80 flex items-center gap-4 shadow-sm">
            <div className="size-11 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserCheck className="size-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Regular Users</p>
              <p className="text-2xl font-bold text-emerald-300">{regularCount}</p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, ID or role..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
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
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Account ID</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Email Verified</th>
                  <th className="py-3.5 px-4">Created At</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground text-sm">
                      {searchQuery ? 'No users found matching your query' : 'No users found'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((userItem) => {
                    const isExpanded = expandedUserId === userItem.id;
                    const createdDate = userItem.createdAt
                      ? new Date(userItem.createdAt).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—';

                    return (
                      <React.Fragment key={userItem.id}>
                        <tr className="hover:bg-secondary/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs shadow">
                                {userItem.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-foreground text-sm">{userItem.name}</span>
                                <span className="text-xs text-muted-foreground">{userItem.email}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-mono text-xs text-purple-300 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 select-all">
                              {userItem.id}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {userItem.role === UserRole.Admin ? (
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
                            {userItem.emailVerified ? (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                                <CheckCircle2 className="size-4" /> Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                                <XCircle className="size-4 text-muted-foreground/60" /> No
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
                              onClick={() => setExpandedUserId(isExpanded ? null : userItem.id)}
                              className="h-8 text-xs gap-1 text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 cursor-pointer"
                            >
                              <Info className="size-3.5" />
                              <span>{isExpanded ? 'Hide' : 'Full Info'}</span>
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
                                  <Key className="size-4" /> User Object Data
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                                  <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 space-y-1">
                                    <span className="text-muted-foreground block text-[11px]">ID (Primary Key):</span>
                                    <span className="font-mono text-foreground font-semibold select-all">{userItem.id}</span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 space-y-1">
                                    <span className="text-muted-foreground block text-[11px]">Full Name:</span>
                                    <span className="text-foreground font-semibold">{userItem.name}</span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 space-y-1">
                                    <span className="text-muted-foreground block text-[11px]">Email Address:</span>
                                    <span className="text-foreground font-semibold">{userItem.email}</span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 space-y-1">
                                    <span className="text-muted-foreground block text-[11px]">Assigned Role:</span>
                                    <span className="text-purple-300 font-semibold">{userItem.role}</span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 space-y-1">
                                    <span className="text-muted-foreground block text-[11px]">Registration Date:</span>
                                    <span className="text-foreground font-semibold">{userItem.createdAt}</span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 space-y-1">
                                    <span className="text-muted-foreground block text-[11px]">Last Updated:</span>
                                    <span className="text-foreground font-semibold">{userItem.updatedAt}</span>
                                  </div>
                                </div>
                                <div className="space-y-1 pt-1">
                                  <span className="text-[11px] text-muted-foreground font-semibold">RAW JSON output:</span>
                                  <pre className="p-3 rounded-lg bg-black/40 border border-border/50 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                                    {JSON.stringify(userItem, null, 2)}
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

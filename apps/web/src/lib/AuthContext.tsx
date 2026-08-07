'use client';

import React, { createContext, useContext } from 'react';
import { authClient, useSession } from './auth-client';
import { User, LoginPayload, RegisterPayload } from './api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email,
        role: (session.user as any).role || 'user',
        createdAt: session.user.createdAt ? session.user.createdAt.toString() : new Date().toISOString(),
      }
    : null;

  const login = async (payload: LoginPayload): Promise<User> => {
    const { data, error } = await authClient.signIn.email({
      email: payload.email,
      password: payload.password,
    });

    if (error) {
      throw new Error(error.message || 'Failed to sign in.');
    }

    if (!data?.user) {
      throw new Error('User account not found.');
    }

    return {
      id: data.user.id,
      name: data.user.name || '',
      email: data.user.email,
      role: (data.user as any).role || 'user',
      createdAt: data.user.createdAt ? data.user.createdAt.toString() : new Date().toISOString(),
    };
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    const { data, error } = await authClient.signUp.email({
      email: payload.email,
      password: payload.password,
      name: payload.name,
      role: payload.role || 'user',
    } as any);

    if (error) {
      throw new Error(error.message || 'Failed to create user account.');
    }

    if (!data?.user) {
      throw new Error('Failed to retrieve user after registration.');
    }

    return {
      id: data.user.id,
      name: data.user.name || '',
      email: data.user.email,
      role: (data.user as any).role || payload.role || 'user',
      createdAt: data.user.createdAt ? data.user.createdAt.toString() : new Date().toISOString(),
    };
  };

  const logout = async (): Promise<void> => {
    await authClient.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading: isPending, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

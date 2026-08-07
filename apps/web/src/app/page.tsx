'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { getItems, createItem, updateItem, deleteItem, type Item } from '@/lib/api';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AuthStatusCard } from '@/components/dashboard/AuthStatusCard';
import { CreateTaskForm } from '@/components/dashboard/CreateTaskForm';
import { TaskList } from '@/components/dashboard/TaskList';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, Lock } from 'lucide-react';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [error, setError] = useState('');

  const fetchItems = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getItems();
      setItems(data);
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    let ignore = false;
    setLoading(true);
    getItems()
      .then((data) => {
        if (!ignore) {
          setItems(data);
          setError('');
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Something went wrong');
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [user, authLoading]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const newItem = await createItem(title, description);
      setItems((prev) => [...prev, newItem]);
      setTitle('');
      setDescription('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const handleUpdateToggle = async (item: Item) => {
    try {
      const updated = await updateItem(item.id, { completed: !item.completed });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const handleStartEdit = (item: Item) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editTitle.trim()) return;

    try {
      const updated = await updateItem(editingItem.id, { title: editTitle, description: editDescription });
      setItems((prev) => prev.map((i) => (i.id === editingItem.id ? updated : i)));
      setEditingItem(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-4xl space-y-10">
        <DashboardHeader />
        <AuthStatusCard user={user} authLoading={authLoading} />

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center font-medium animate-in fade-in slide-in-from-top-2 duration-200">
            {error}
          </div>
        )}

        {authLoading ? (
          <div className="py-20 px-6 border border-border/60 rounded-2xl bg-secondary/10 backdrop-blur-xl flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-200">
            <div className="size-10 animate-spin rounded-full border-3 border-emerald-500 border-t-transparent" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Загрузка сессии...</span>
          </div>
        ) : !user ? (
          <div className="py-16 px-6 border border-border/80 rounded-2xl bg-secondary/15 backdrop-blur-xl shadow-xl flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
              <Lock className="size-8" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Залогиньтесь, пожалуйста</h2>
              <p className="text-sm text-muted-foreground">
                Чтобы просматривать и управлять личными задачами, необходимо войти в свою учетную запись.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Link href="/login">
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 cursor-pointer shadow-lg shadow-emerald-500/20">
                  <LogIn className="size-4" /> Войти
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="border-border hover:bg-secondary font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 cursor-pointer">
                  <UserPlus className="size-4 text-emerald-400" /> Зарегистрироваться
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <CreateTaskForm
              title={title}
              description={description}
              setTitle={setTitle}
              setDescription={setDescription}
              onSubmit={handleCreate}
            />
            <TaskList
              items={items}
              loading={loading}
              editingItem={editingItem}
              editTitle={editTitle}
              editDescription={editDescription}
              setEditTitle={setEditTitle}
              setEditDescription={setEditDescription}
              onRefresh={fetchItems}
              onToggle={handleUpdateToggle}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={() => setEditingItem(null)}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import type { Item } from '@/lib/api';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  items: Item[];
  loading: boolean;
  editingItem: Item | null;
  editTitle: string;
  editDescription: string;
  setEditTitle: (val: string) => void;
  setEditDescription: (val: string) => void;
  onRefresh: () => void;
  onToggle: (item: Item) => void;
  onStartEdit: (item: Item) => void;
  onSaveEdit: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
}

export function TaskList({
  items,
  loading,
  editingItem,
  editTitle,
  editDescription,
  setEditTitle,
  setEditDescription,
  onRefresh,
  onToggle,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: TaskListProps) {
  return (
    <div className="md:col-span-2 space-y-4">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          Tasks{' '}
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary/80 text-muted-foreground">
            {items.length}
          </span>
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="text-xs font-semibold text-teal-400 hover:text-teal-300 hover:bg-secondary/40 transition-colors gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="text-xs text-muted-foreground">Loading tasks...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl text-muted-foreground flex flex-col items-center justify-center space-y-2 bg-secondary/10">
          <p className="text-sm font-medium">No tasks available.</p>
          <p className="text-xs text-muted-foreground/80">Add some tasks on the left to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <TaskItem
              key={item.id}
              item={item}
              isEditing={editingItem?.id === item.id}
              editTitle={editTitle}
              editDescription={editDescription}
              setEditTitle={setEditTitle}
              setEditDescription={setEditDescription}
              onToggle={onToggle}
              onStartEdit={onStartEdit}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

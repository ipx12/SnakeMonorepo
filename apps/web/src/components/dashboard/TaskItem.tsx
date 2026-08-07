import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit2, Trash2 } from 'lucide-react';
import type { Item } from '@/lib/api';

interface TaskItemProps {
  item: Item;
  isEditing: boolean;
  editTitle: string;
  editDescription: string;
  setEditTitle: (val: string) => void;
  setEditDescription: (val: string) => void;
  onToggle: (item: Item) => void;
  onStartEdit: (item: Item) => void;
  onSaveEdit: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
}

export function TaskItem({
  item,
  isEditing,
  editTitle,
  editDescription,
  setEditTitle,
  setEditDescription,
  onToggle,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: TaskItemProps) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 ${
        item.completed
          ? 'bg-secondary/10 border-border/40 opacity-70 hover:opacity-90'
          : 'bg-secondary/20 border-border hover:border-border-foreground/20 hover:bg-secondary/30'
      }`}
    >
      {isEditing ? (
        <form onSubmit={onSaveEdit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
              className="bg-background/80"
            />
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={2}
              className="bg-background/80 resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="submit"
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-400 text-primary-foreground font-semibold px-4 cursor-pointer"
            >
              Save
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCancelEdit}
              className="px-4 cursor-pointer border border-border"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Checkbox
              checked={item.completed}
              onCheckedChange={() => onToggle(item)}
              className="mt-1 border-border/80 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
            />
            <div className="min-w-0">
              <h3
                className={`font-semibold text-base leading-tight truncate ${
                  item.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}
              >
                {item.title}
              </h3>
              {item.description && (
                <p className="text-muted-foreground text-sm mt-1 whitespace-pre-wrap leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onStartEdit(item)}
              className="text-muted-foreground hover:text-emerald-400 hover:bg-secondary transition-all cursor-pointer"
              title="Edit"
            >
              <Edit2 className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(item.id)}
              className="text-muted-foreground hover:text-destructive hover:bg-secondary transition-all cursor-pointer"
              title="Delete"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

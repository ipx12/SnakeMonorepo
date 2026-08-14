import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

interface CreateTaskFormProps {
  title: string;
  description: string;
  setTitle: (newTitle: string) => void;
  setDescription: (newDescription: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function CreateTaskForm({
  title,
  description,
  setTitle,
  setDescription,
  onSubmit,
}: CreateTaskFormProps) {
  return (
    <div className="md:col-span-1 bg-secondary/30 border border-border rounded-2xl p-6 backdrop-blur-md shadow-xl">
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <Plus className="size-4 text-emerald-400" /> Create New Task
      </h2>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Title
          </label>
          <Input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs to be done?"
            required
            className="bg-background/50 border-border/80 focus-visible:ring-emerald-500/30"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Provide some details..."
            rows={3}
            className="bg-background/50 border-border/80 focus-visible:ring-emerald-500/30 resize-none"
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-primary-foreground font-semibold py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98]"
        >
          Add Task
        </Button>
      </form>
    </div>
  );
}

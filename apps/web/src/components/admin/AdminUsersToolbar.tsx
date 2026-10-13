import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export interface AdminUsersToolbarProps {
  searchQuery: string;
  onSearchChange: (newQuery: string) => void;
  pageSize: number;
  onPageSizeChange: (newPageSize: number) => void;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;

export function AdminUsersToolbar({
  searchQuery,
  onSearchChange,
  pageSize,
  onPageSizeChange,
}: AdminUsersToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, email, ID or role..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="pl-9 bg-secondary/30 border-border/80 text-sm focus-visible:ring-purple-500"
        />
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Rows per page:</span>
        <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-lg border border-border/80">
          {PAGE_SIZE_OPTIONS.map((sizeOption) => (
            <button
              key={sizeOption}
              type="button"
              onClick={() => onPageSizeChange(sizeOption)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                pageSize === sizeOption
                  ? 'bg-purple-500 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {sizeOption}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

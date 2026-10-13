import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRecords: number;
  isLoading: boolean;
  onPageChange: (newPage: number) => void;
}

export function AdminPagination({
  currentPage,
  totalPages,
  pageSize,
  totalRecords,
  isLoading,
  onPageChange,
}: AdminPaginationProps) {
  const startRecordIndex = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecordIndex = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/60 bg-secondary/25">
      <div className="text-xs text-muted-foreground text-center sm:text-left">
        Showing <span className="font-semibold text-foreground">{startRecordIndex}</span> to{' '}
        <span className="font-semibold text-foreground">{endRecordIndex}</span> of{' '}
        <span className="font-semibold text-foreground">{totalRecords}</span> accounts
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="h-8 px-2.5 sm:px-3 text-xs border-border hover:bg-secondary cursor-pointer disabled:opacity-50"
        >
          <ChevronLeft className="size-3.5 mr-1" /> Previous
        </Button>

        <div className="flex items-center gap-1 px-1 sm:px-2 text-xs font-semibold text-purple-300">
          <span>Page</span>
          <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-200">
            {currentPage}
          </span>
          <span>of {totalPages || 1}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className="h-8 px-2.5 sm:px-3 text-xs border-border hover:bg-secondary cursor-pointer disabled:opacity-50"
        >
          Next <ChevronRight className="size-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}

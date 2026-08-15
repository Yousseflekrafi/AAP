interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, totalCount, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <span className="text-gray-500 dark:text-gray-400">
        Page {page} / {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md bg-white dark:bg-gray-800 px-3 py-1 border border-gray-200 dark:border-gray-800 shadow-sm shadow-gray-900/5 dark:shadow-none disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md bg-white dark:bg-gray-800 px-3 py-1 border border-gray-200 dark:border-gray-800 shadow-sm shadow-gray-900/5 dark:shadow-none disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

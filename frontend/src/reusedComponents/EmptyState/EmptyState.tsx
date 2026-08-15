import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 py-12 px-6 text-center">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</p>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
      {action}
    </div>
  );
}

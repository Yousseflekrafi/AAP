import type { ReactNode } from "react";

export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-12 w-full max-w-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm">
      <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
      {children}
    </div>
  );
}

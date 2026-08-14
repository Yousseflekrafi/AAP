import type { ReactNode } from "react";

export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-16 w-full max-w-sm rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-7 shadow-lg shadow-gray-900/5 dark:shadow-none">
      <h1 className="mb-6 font-display text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{title}</h1>
      {children}
    </div>
  );
}

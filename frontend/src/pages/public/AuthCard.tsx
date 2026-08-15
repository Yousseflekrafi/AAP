import type { ReactNode } from "react";

export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-16 w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 p-7 shadow-xl shadow-gray-900/10 dark:shadow-none">
      <h1 className="mb-6 font-display text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{title}</h1>
      {children}
    </div>
  );
}

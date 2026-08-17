import type { ReactNode } from "react";
import { Icon, type IconName } from "../Icon";

interface CardProps {
  icon?: IconName;
  title: string;
  description?: string;
  headerAction?: ReactNode;
  danger?: boolean;
  children: ReactNode;
  className?: string;
}

export function Card({ icon, title, description, headerAction, danger = false, children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 ${
        danger
          ? "border-red-200 dark:border-red-900/50"
          : "border-gray-200 dark:border-gray-800"
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {icon && (
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                danger
                  ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                  : "bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400"
              }`}
            >
              <Icon name={icon} size={18} />
            </span>
          )}
          <div>
            <h2 className={`text-lg font-bold ${danger ? "text-red-700 dark:text-red-400" : "text-gray-900 dark:text-gray-100"}`}>
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
          </div>
        </div>
        {headerAction}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

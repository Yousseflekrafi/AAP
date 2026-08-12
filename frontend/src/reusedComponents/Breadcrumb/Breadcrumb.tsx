import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500 dark:text-gray-400">
      <ol className="flex items-center gap-1.5">
        {items.map((item, idx) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {idx > 0 && <span className="text-gray-300 dark:text-gray-700">/</span>}
            {item.to ? (
              <Link to={item.to} className="hover:text-gray-900 dark:hover:text-gray-100">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-gray-100">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

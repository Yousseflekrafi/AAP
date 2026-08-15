import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "../Loader";
import { EmptyState } from "../EmptyState";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  onRowClick,
}: DataTableProps<T>) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader />
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState title={t("common.noData")} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white dark:bg-gray-900 shadow-sm shadow-gray-900/5 dark:shadow-none">
      <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
        <thead className="bg-gray-50/80 dark:bg-gray-900/40">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/40" : ""}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-2 text-gray-800 dark:text-gray-200">
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

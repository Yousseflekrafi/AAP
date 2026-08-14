import { useTranslation } from "react-i18next";

export type AccountStatus = "active" | "deactivated" | "deleted";

const STATUS_STYLES: Record<AccountStatus, string> = {
  active: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  deactivated: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  deleted: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 line-through",
};

export function StatusBadge({ status }: { status: AccountStatus }) {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {t(`status.${status}`)}
    </span>
  );
}

export function OnlineDot({ online }: { online: boolean }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
      <span className={`h-2 w-2 rounded-full ${online ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />
      {t(online ? "status.online" : "status.offline")}
    </span>
  );
}

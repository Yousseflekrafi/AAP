import { useTranslation } from "react-i18next";
import { EmptyState } from "../../reusedComponents/EmptyState";

export default function Notifications() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t("nav.notifications")}</h1>
      <EmptyState title={t("common.noData")} description="Notifications will appear here in a future phase." />
    </div>
  );
}

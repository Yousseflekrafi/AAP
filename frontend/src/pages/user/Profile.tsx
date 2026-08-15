import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t("nav.profile")}</h1>
      <div className="max-w-lg rounded-xl bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 shadow-sm shadow-gray-900/5 dark:shadow-none">
        <dl className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
          <dt className="text-gray-500 dark:text-gray-400">{t("common.email")}</dt>
          <dd className="text-gray-900 dark:text-gray-100">{user.email}</dd>
          <dt className="text-gray-500 dark:text-gray-400">{t("auth.firstName")}</dt>
          <dd className="text-gray-900 dark:text-gray-100">{user.first_name || "—"}</dd>
          <dt className="text-gray-500 dark:text-gray-400">{t("auth.lastName")}</dt>
          <dd className="text-gray-900 dark:text-gray-100">{user.last_name || "—"}</dd>
          <dt className="text-gray-500 dark:text-gray-400">Verified</dt>
          <dd className="text-gray-900 dark:text-gray-100">{user.is_email_verified ? "Yes" : "No"}</dd>
        </dl>
      </div>
    </div>
  );
}

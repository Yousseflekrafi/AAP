import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-6 py-20 text-center">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{t("common.appName")}</h1>
      <p className="max-w-md text-gray-500 dark:text-gray-400">{t("common.tagline")}</p>
      <div className="flex gap-3">
        <Link to="/login" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          {t("auth.login")}
        </Link>
        <Link
          to="/register"
          className="rounded-md border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {t("auth.register")}
        </Link>
      </div>
    </div>
  );
}

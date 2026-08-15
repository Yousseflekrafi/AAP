import { useTranslation } from "react-i18next";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/30 py-12 px-6 text-center shadow-sm shadow-red-900/5 dark:shadow-none">
      <p className="text-sm font-medium text-red-700 dark:text-red-300">
        {message ?? t("common.somethingWentWrong")}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
        >
          {t("common.retry")}
        </button>
      )}
    </div>
  );
}

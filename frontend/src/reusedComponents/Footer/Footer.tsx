import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Logo } from "../Logo";

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-white dark:bg-gray-900 shadow-[inset_0_1px_0_rgba(0,0,0,0.04)] dark:shadow-none">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:flex-row sm:justify-between">
        <div className="flex max-w-xs flex-col gap-3">
          <Logo height={22} />
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("footer.tagline")}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:flex sm:gap-16">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t("footer.product")}</p>
            <a href="/#how-it-works" className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-600">
              {t("home.navHowItWorks")}
            </a>
            <a href="/#security" className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-600">
              {t("home.navSecurity")}
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t("footer.company")}</p>
            <Link to="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-600">
              {t("home.signIn")}
            </Link>
            <Link to="/register" className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-600">
              {t("home.getStarted")}
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 dark:border-gray-800/60 px-6 py-4 text-center text-xs text-gray-400">
        {t("footer.copyright", { year })}
      </div>
    </footer>
  );
}

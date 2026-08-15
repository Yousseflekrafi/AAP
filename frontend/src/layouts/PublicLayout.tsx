import { Link, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../reusedComponents/LanguageSwitcher";
import { ThemeSwitcher } from "../reusedComponents/ThemeSwitcher";
import { Logo } from "../reusedComponents/Logo";
import { Footer } from "../reusedComponents/Footer";

export function PublicLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center justify-between bg-white dark:bg-gray-900 px-6 py-4 shadow-sm shadow-gray-900/5 dark:shadow-none">
        <Link to="/" className="flex items-center">
          <Logo height={26} />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300 sm:flex">
          <a href="/#how-it-works" className="hover:text-brand-600">
            {t("home.navHowItWorks")}
          </a>
          <a href="/#security" className="hover:text-brand-600">
            {t("home.navSecurity")}
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
          {pathname !== "/login" && (
            <Link
              to="/login"
              className="hidden rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 sm:inline-block"
            >
              {t("home.signIn")}
            </Link>
          )}
          {pathname !== "/register" && (
            <Link
              to="/register"
              className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              {t("home.getStarted")}
            </Link>
          )}
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center px-4 pb-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

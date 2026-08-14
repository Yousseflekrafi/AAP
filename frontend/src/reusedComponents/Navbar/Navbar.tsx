import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Icon } from "../Icon";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { NotificationBell } from "../NotificationBell";
import type { SidebarVariant } from "../Sidebar";
import { useAppDispatch } from "../../store";
import { toggleSidebar } from "../../store/slices/sidebarSlice";
import { useAuth } from "../../hooks/useAuth";

export function Navbar({ variant = "customer" }: { variant?: SidebarVariant }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user, isAdmin, logout } = useAuth();
  const isAdminChrome = variant === "admin";

  return (
    <header
      className={`flex h-16 items-center justify-between border-b px-4 ${
        isAdminChrome
          ? "border-admin-border bg-admin-surface"
          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Toggle sidebar"
          className={`flex h-9 w-9 items-center justify-center rounded-md md:hidden ${
            isAdminChrome
              ? "text-slate-300 hover:bg-white/5"
              : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          <Icon name="menu" size={18} />
        </button>
        {isAdminChrome && (
          <span className="hidden items-center gap-1.5 rounded-full bg-brand-600/15 px-2.5 py-1 text-xs font-semibold text-brand-400 sm:inline-flex">
            <Icon name="shield" size={12} />
            {t("admin.console")}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {user && isAdmin && (
          <Link
            to={isAdminChrome ? "/dashboard" : "/admin"}
            className={`hidden rounded-md border px-3 py-1.5 text-sm font-medium sm:inline-block ${
              isAdminChrome
                ? "border-admin-border text-slate-200 hover:bg-white/5"
                : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {isAdminChrome ? t("admin.myWorkspace") : t("admin.consolePanel")}
          </Link>
        )}
        <LanguageSwitcher />
        <ThemeSwitcher />
        {user && <NotificationBell />}
        {user && (
          <div className="ml-2 flex items-center gap-2">
            <span className={`hidden text-sm sm:inline ${isAdminChrome ? "text-slate-200" : "text-gray-700 dark:text-gray-300"}`}>
              {user.full_name}
            </span>
            <button
              type="button"
              onClick={() => void logout()}
              aria-label={t("common.logout")}
              className={`flex h-9 w-9 items-center justify-center rounded-md ${
                isAdminChrome
                  ? "text-slate-300 hover:bg-white/5"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <Icon name="logout" size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

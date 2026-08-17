import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Icon } from "../Icon";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { NotificationBell } from "../NotificationBell";
import { UserMenu } from "../UserMenu";
import type { SidebarVariant } from "../Sidebar";
import { useAppDispatch } from "../../store";
import { toggleSidebar } from "../../store/slices/sidebarSlice";
import { useAuth } from "../../hooks/useAuth";
import { usePermission } from "../../hooks/usePermission";

export function Navbar({ variant = "customer" }: { variant?: SidebarVariant }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const canViewConsole = usePermission("admin.console.view");
  const isAdminChrome = variant === "admin";

  return (
    <header
      className={`flex h-16 items-center justify-between px-4 relative z-10 ${
        isAdminChrome ? "bg-admin-surface border-b border-admin-border" : "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Toggle sidebar"
          className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-150 md:hidden ${
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

      <div className="flex items-center gap-3">
        {user && canViewConsole && (
          <Link
            to={isAdminChrome ? "/dashboard" : "/admin"}
            className={`hidden rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 sm:inline-block ${
              isAdminChrome
                ? "text-slate-200 hover:bg-white/5"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {isAdminChrome ? t("admin.myWorkspace") : t("admin.consolePanel")}
          </Link>
        )}

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>

        {user && (
          <>
            <span className={`h-6 w-px ${isAdminChrome ? "bg-admin-border" : "bg-gray-200 dark:bg-gray-700"}`} />
            <NotificationBell />
            <UserMenu dark={isAdminChrome} />
          </>
        )}
      </div>
    </header>
  );
}

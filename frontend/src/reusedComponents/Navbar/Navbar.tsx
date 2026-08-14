import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "../Icon";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { NotificationBell } from "../NotificationBell";
import { useAppDispatch } from "../../store";
import { toggleSidebar } from "../../store/slices/sidebarSlice";
import { useAuth } from "../../hooks/useAuth";

export function Navbar() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const inAdminSection = location.pathname.startsWith("/admin");

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4">
      <button
        type="button"
        onClick={() => dispatch(toggleSidebar())}
        aria-label="Toggle sidebar"
        className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 md:hidden"
      >
        <Icon name="menu" size={18} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {user && isAdmin && (
          <Link
            to={inAdminSection ? "/dashboard" : "/admin"}
            className="hidden rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 sm:inline-block"
          >
            {inAdminSection ? "My dashboard" : "Admin panel"}
          </Link>
        )}
        <LanguageSwitcher />
        <ThemeSwitcher />
        {user && <NotificationBell />}
        {user && (
          <div className="ml-2 flex items-center gap-2">
            <span className="hidden text-sm text-gray-700 dark:text-gray-300 sm:inline">{user.full_name}</span>
            <button
              type="button"
              onClick={() => void logout()}
              aria-label={t("common.logout")}
              className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <Icon name="logout" size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

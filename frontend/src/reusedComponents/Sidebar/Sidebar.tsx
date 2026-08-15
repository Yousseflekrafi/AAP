import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon, type IconName } from "../Icon";
import { Logo } from "../Logo";
import { useAppDispatch, useAppSelector } from "../../store";
import { selectSidebarCollapsed, setSidebarCollapsed } from "../../store/slices/sidebarSlice";
import { selectCurrentUser } from "../../store/slices/authSlice";

export interface SidebarLink {
  to: string;
  labelKey: string;
  icon: IconName;
}

export type SidebarVariant = "customer" | "admin";

export function Sidebar({ links, variant = "customer" }: { links: SidebarLink[]; variant?: SidebarVariant }) {
  const { t } = useTranslation();
  const mobileOpen = useAppSelector(selectSidebarCollapsed);
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const isAdmin = variant === "admin";
  const closeMobile = () => dispatch(setSidebarCollapsed(false));

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={closeMobile} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col transition-transform md:static md:z-auto md:w-16 md:translate-x-0 xl:w-60 ${
          isAdmin ? "bg-admin-bg border-r border-admin-border" : "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 items-center gap-2 px-4">
          <span className="md:hidden xl:flex">
            {isAdmin ? (
              <span className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white">AAP</span>
                <span className="text-[11px] font-medium uppercase tracking-wider text-brand-400">
                  {t("admin.console")}
                </span>
              </span>
            ) : (
              <Logo height={22} />
            )}
          </span>
          <span className={`hidden md:inline xl:hidden text-sm font-bold ${isAdmin ? "text-brand-400" : "text-brand-600"}`}>
            AAP
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-2 py-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              onClick={closeMobile}
              className={({ isActive }) => {
                if (isAdmin) {
                  return `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-600/15 text-brand-400"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`;
                }
                return `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`;
              }}
            >
              <Icon name={link.icon} size={18} />
              <span className="md:hidden xl:inline">{t(link.labelKey)}</span>
            </NavLink>
          ))}
        </nav>
        {user && (
          <div className={`p-2 ${isAdmin ? "border-t border-admin-border" : "border-t border-gray-200 dark:border-gray-800"}`}>
            <div
              className={`flex items-center gap-2.5 rounded-lg px-2 py-2 ${
                isAdmin ? "bg-white/5" : "bg-gray-50 dark:bg-gray-800/60"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isAdmin ? "bg-brand-600/20 text-brand-400" : "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
                }`}
              >
                {user.full_name?.[0]?.toUpperCase() ?? user.email[0]?.toUpperCase()}
              </span>
              <div className="min-w-0 md:hidden xl:block">
                <p className={`truncate text-sm font-medium ${isAdmin ? "text-white" : "text-gray-900 dark:text-gray-100"}`}>
                  {user.full_name || user.email}
                </p>
                <p className={`truncate text-xs ${isAdmin ? "text-slate-400" : "text-gray-500 dark:text-gray-400"}`}>
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

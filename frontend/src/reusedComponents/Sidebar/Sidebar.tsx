import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon, type IconName } from "../Icon";
import { Logo } from "../Logo";
import { useAppSelector } from "../../store";
import { selectSidebarCollapsed } from "../../store/slices/sidebarSlice";

export interface SidebarLink {
  to: string;
  labelKey: string;
  icon: IconName;
}

export type SidebarVariant = "customer" | "admin";

export function Sidebar({ links, variant = "customer" }: { links: SidebarLink[]; variant?: SidebarVariant }) {
  const { t } = useTranslation();
  const collapsed = useAppSelector(selectSidebarCollapsed);
  const isAdmin = variant === "admin";

  return (
    <aside
      className={`hidden shrink-0 md:block transition-all ${
        isAdmin ? "bg-admin-bg shadow-xl shadow-black/20" : "bg-white dark:bg-gray-900 shadow-sm shadow-gray-900/5 dark:shadow-none"
      } ${collapsed ? "w-16" : "w-60"}`}
    >
      <div className="flex h-16 items-center gap-2 px-4">
        {collapsed ? (
          <span className={`text-sm font-bold ${isAdmin ? "text-brand-400" : "text-brand-600"}`}>AAP</span>
        ) : isAdmin ? (
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white">AAP</span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-brand-400">
              {t("admin.console")}
            </span>
          </div>
        ) : (
          <Logo height={22} />
        )}
      </div>
      <nav className="flex flex-col gap-1 px-2 py-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
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
            {!collapsed && <span>{t(link.labelKey)}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

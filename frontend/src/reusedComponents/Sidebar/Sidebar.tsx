import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon, type IconName } from "../Icon";
import { useAppSelector } from "../../store";
import { selectSidebarCollapsed } from "../../store/slices/sidebarSlice";

export interface SidebarLink {
  to: string;
  labelKey: string;
  icon: IconName;
}

export function Sidebar({ links }: { links: SidebarLink[] }) {
  const { t } = useTranslation();
  const collapsed = useAppSelector(selectSidebarCollapsed);

  return (
    <aside
      className={`hidden shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 md:block ${
        collapsed ? "w-16" : "w-56"
      } transition-all`}
    >
      <div className="flex h-14 items-center px-4 font-semibold text-gray-900 dark:text-gray-100">
        {collapsed ? "AAP" : "AAP — AI Administration"}
      </div>
      <nav className="flex flex-col gap-1 px-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`
            }
          >
            <Icon name={link.icon} size={18} />
            {!collapsed && <span>{t(link.labelKey)}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

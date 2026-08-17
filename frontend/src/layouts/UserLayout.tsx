import type { SidebarGroup } from "../reusedComponents/Sidebar";
import { DashboardLayout } from "./DashboardLayout";

// Messages and Notifications moved into the header user-menu dropdown and
// the notification bell, respectively — they're no longer standalone
// sidebar links (see reusedComponents/UserMenu, reusedComponents/NotificationBell).
const USER_GROUPS: SidebarGroup[] = [
  {
    labelKey: "nav.groupWorkspace",
    links: [
      { to: "/dashboard", labelKey: "nav.home", icon: "home" },
      { to: "/projects", labelKey: "nav.projects", icon: "folder" },
      { to: "/organization", labelKey: "nav.organization", icon: "building" },
      { to: "/members", labelKey: "nav.members", icon: "users" },
    ],
  },
  {
    labelKey: "nav.groupAccount",
    links: [
      { to: "/settings", labelKey: "nav.settings", icon: "settings" },
      { to: "/profile", labelKey: "nav.profile", icon: "user" },
    ],
  },
];

export function UserLayout() {
  return <DashboardLayout groups={USER_GROUPS} />;
}

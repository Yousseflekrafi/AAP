import type { SidebarLink } from "../reusedComponents/Sidebar";
import { DashboardLayout } from "./DashboardLayout";

const USER_LINKS: SidebarLink[] = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: "dashboard" },
  { to: "/notifications", labelKey: "nav.notifications", icon: "bell" },
  { to: "/profile", labelKey: "nav.profile", icon: "user" },
  { to: "/settings", labelKey: "nav.settings", icon: "settings" },
];

export function UserLayout() {
  return <DashboardLayout links={USER_LINKS} />;
}

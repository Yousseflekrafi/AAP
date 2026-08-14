import type { SidebarLink } from "../reusedComponents/Sidebar";
import { DashboardLayout } from "./DashboardLayout";

const ADMIN_LINKS: SidebarLink[] = [
  { to: "/admin", labelKey: "admin.dashboard", icon: "dashboard" },
  { to: "/admin/users", labelKey: "nav.users", icon: "users" },
  { to: "/admin/messages", labelKey: "nav.messages", icon: "bell" },
  { to: "/admin/notifications", labelKey: "nav.notifications", icon: "bell" },
  { to: "/admin/audit", labelKey: "nav.audit", icon: "shield" },
];

export function AdminLayout() {
  return <DashboardLayout links={ADMIN_LINKS} variant="admin" />;
}

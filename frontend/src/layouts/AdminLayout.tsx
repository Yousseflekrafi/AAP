import type { SidebarLink } from "../reusedComponents/Sidebar";
import { DashboardLayout } from "./DashboardLayout";
import { usePermission } from "../hooks/usePermission";

const ADMIN_LINKS: (SidebarLink & { permission?: string })[] = [
  { to: "/admin", labelKey: "admin.dashboard", icon: "dashboard" },
  { to: "/admin/users", labelKey: "nav.users", icon: "users", permission: "users.view_all" },
  { to: "/admin/messages", labelKey: "nav.messages", icon: "bell" },
  { to: "/admin/notifications", labelKey: "nav.notifications", icon: "bell" },
  { to: "/admin/audit", labelKey: "nav.audit", icon: "shield", permission: "audit.view" },
];

export function AdminLayout() {
  const canViewUsers = usePermission("users.view_all");
  const canViewAudit = usePermission("audit.view");
  const permissionMap: Record<string, boolean> = {
    "users.view_all": canViewUsers,
    "audit.view": canViewAudit,
  };
  const links = ADMIN_LINKS.filter((link) => !link.permission || permissionMap[link.permission]);
  return <DashboardLayout groups={[{ links }]} variant="admin" />;
}

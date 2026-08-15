import type { SidebarLink } from "../reusedComponents/Sidebar";
import { DashboardLayout } from "./DashboardLayout";

// Blueprint section 7: "The global sidebar stays simple: Home, Projects,
// Organization, Members, Notifications, Settings, and the user profile.
// Database tables, AI, and charts live inside a project, not the global
// sidebar."
const USER_LINKS: SidebarLink[] = [
  { to: "/dashboard", labelKey: "nav.home", icon: "home" },
  { to: "/projects", labelKey: "nav.projects", icon: "folder" },
  { to: "/organization", labelKey: "nav.organization", icon: "building" },
  { to: "/members", labelKey: "nav.members", icon: "users" },
  { to: "/messages", labelKey: "nav.messages", icon: "chat" },
  { to: "/notifications", labelKey: "nav.notifications", icon: "bell" },
  { to: "/settings", labelKey: "nav.settings", icon: "settings" },
  { to: "/profile", labelKey: "nav.profile", icon: "user" },
];

export function UserLayout() {
  return <DashboardLayout links={USER_LINKS} />;
}

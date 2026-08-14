import { Outlet } from "react-router-dom";
import { Sidebar, type SidebarLink, type SidebarVariant } from "../reusedComponents/Sidebar";
import { Navbar } from "../reusedComponents/Navbar";

export function DashboardLayout({
  links,
  variant = "customer",
}: {
  links: SidebarLink[];
  variant?: SidebarVariant;
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar links={links} variant={variant} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar variant={variant} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

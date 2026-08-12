import { Outlet } from "react-router-dom";
import { Sidebar, type SidebarLink } from "../reusedComponents/Sidebar";
import { Navbar } from "../reusedComponents/Navbar";

export function DashboardLayout({ links }: { links: SidebarLink[] }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar links={links} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

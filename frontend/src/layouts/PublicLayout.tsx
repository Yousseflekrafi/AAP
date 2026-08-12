import { Outlet } from "react-router-dom";
import { LanguageSwitcher } from "../reusedComponents/LanguageSwitcher";
import { ThemeSwitcher } from "../reusedComponents/ThemeSwitcher";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">AAP</span>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </header>
      <main className="flex flex-col items-center px-4 pb-12">
        <Outlet />
      </main>
    </div>
  );
}

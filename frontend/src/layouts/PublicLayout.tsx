import { Link, Outlet } from "react-router-dom";
import { LanguageSwitcher } from "../reusedComponents/LanguageSwitcher";
import { ThemeSwitcher } from "../reusedComponents/ThemeSwitcher";
import { Logo } from "../reusedComponents/Logo";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <Link to="/" className="flex items-center">
          <Logo height={26} />
        </Link>
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

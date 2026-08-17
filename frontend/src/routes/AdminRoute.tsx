import { Navigate, Outlet } from "react-router-dom";
import { usePermission } from "../hooks/usePermission";

export function AdminRoute() {
  const canViewConsole = usePermission("admin.console.view");
  if (!canViewConsole) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

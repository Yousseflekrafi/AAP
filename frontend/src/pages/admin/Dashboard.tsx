import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchPlatformStats, fetchOrgStats } from "../../services/dashboardService";
import { useAuth } from "../../hooks/useAuth";
import { Loader } from "../../reusedComponents/Loader";

function StatCard({ label, value, to }: { label: string; value: string | number; to?: string }) {
  const content = (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

function SuperAdminStats() {
  const { data, isLoading } = useQuery({ queryKey: ["platform-stats"], queryFn: fetchPlatformStats });

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard label="Organizations" value={data.organizations.total} to="/admin" />
      <StatCard label="Suspended orgs" value={data.organizations.suspended} />
      <StatCard label="Users" value={data.users.total} to="/admin/users" />
      <StatCard label="Unverified users" value={data.users.pending_verification} />
      <StatCard label="Applications" value={data.applications.total} />
      <StatCard label="Failing connections" value={data.connections.failing} />
      <StatCard label="Security events (24h)" value={data.security.events_last_24h} to="/admin/audit" />
      <StatCard label="Open admin messages" value={data.admin_messages.open} to="/admin/messages" />
    </div>
  );
}

function AdminStats() {
  const { data, isLoading } = useQuery({ queryKey: ["org-stats"], queryFn: fetchOrgStats });

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard label="My organizations" value={data.organizations} />
      <StatCard label="Members" value={data.members} to="/admin/users" />
      <StatCard label="Applications" value={data.applications} />
      <StatCard label="Failing connections" value={data.connections.failing} />
    </div>
  );
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { isSuperAdmin } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t("admin.dashboard")}</h1>
      {isSuperAdmin ? <SuperAdminStats /> : <AdminStats />}
    </div>
  );
}

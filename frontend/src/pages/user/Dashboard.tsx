import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { useCurrentOrganization } from "../../hooks/useCurrentOrganization";
import { fetchOrganizationStats } from "../../services/dashboardService";
import { ChartCard, BarChart, PieChart } from "../../reusedComponents/Charts";
import { Loader } from "../../reusedComponents/Loader";
import { ErrorState } from "../../reusedComponents/ErrorState";
import { Icon, type IconName } from "../../reusedComponents/Icon";

function StatCard({
  label,
  value,
  icon,
  actionLabel,
  onAction,
}: {
  label: string;
  value: string | number;
  icon: IconName;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800 shadow-sm shadow-gray-900/5 dark:shadow-none">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
          <Icon name={icon} size={18} />
        </span>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="self-start rounded-md bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        {actionLabel}
      </button>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organization, loading: orgLoading, error: orgError } = useCurrentOrganization();

  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ["organization-stats", organization?.id],
    queryFn: () => fetchOrganizationStats(organization!.id),
    enabled: !!organization,
  });

  if (orgLoading || isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader />
      </div>
    );
  }

  if (orgError || isError || !stats) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  const envLabels: Record<string, string> = {
    development: t("project.development"),
    staging: t("project.staging"),
    production: t("project.production"),
  };
  const envEntries = Object.entries(stats.projects.by_environment).filter(([, count]) => count > 0);

  const roleLabels: Record<string, string> = {
    owner: t("organization.owner"),
    admin: t("organization.admin"),
    member: t("organization.member"),
  };
  const roleEntries = Object.entries(stats.members.by_role).filter(([, count]) => count > 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t("nav.dashboard")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {user ? `${t("common.email")}: ${user.email}` : null}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("nav.projects")}
          value={stats.projects.total}
          icon="folder"
          actionLabel={t("project.newProject")}
          onAction={() => navigate("/projects")}
        />
        <StatCard
          label={t("nav.members")}
          value={stats.members.total}
          icon="users"
          actionLabel={t("organization.addMember")}
          onAction={() => navigate("/members")}
        />
        <StatCard
          label={t("status.online")}
          value={stats.members.online}
          icon="users"
          actionLabel={t("nav.members")}
          onAction={() => navigate("/members")}
        />
        <StatCard
          label={t("project.connection")}
          value={`${stats.connections.ok}/${stats.connections.total}`}
          icon="database"
          actionLabel={t("nav.projects")}
          onAction={() => navigate("/projects")}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={t("nav.projects")} subtitle={t("project.environment")}>
          {envEntries.length > 0 ? (
            <BarChart
              categories={envEntries.map(([env]) => envLabels[env] ?? env)}
              series={[{ name: t("nav.projects"), data: envEntries.map(([, count]) => count) }]}
              height={260}
            />
          ) : (
            <p className="py-16 text-center text-sm text-gray-400">{t("project.noProjects")}</p>
          )}
        </ChartCard>
        <ChartCard title={t("nav.members")} subtitle={t("organization.role")}>
          {roleEntries.length > 0 ? (
            <PieChart
              data={roleEntries.map(([role, count]) => ({ name: roleLabels[role] ?? role, value: count }))}
              height={260}
            />
          ) : (
            <p className="py-16 text-center text-sm text-gray-400">{t("common.noData")}</p>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

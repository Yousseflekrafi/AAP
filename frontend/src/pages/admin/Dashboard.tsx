import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../../services/adminService";
import { ChartCard, BarChart } from "../../reusedComponents/Charts";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { data } = useQuery({ queryKey: ["admin-users-summary"], queryFn: () => fetchUsers(1) });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t("admin.dashboard")}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total users</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{data?.count ?? "—"}</p>
        </div>
      </div>

      <ChartCard title="Signups (last 7 days)">
        <BarChart
          categories={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
          series={[{ name: "Signups", data: [2, 4, 1, 6, 3, 5, 2] }]}
        />
      </ChartCard>
    </div>
  );
}

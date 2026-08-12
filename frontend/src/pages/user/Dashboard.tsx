import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { ChartCard, LineChart, PieChart } from "../../reusedComponents/Charts";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t("nav.dashboard")}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {user ? `${t("common.email")}: ${user.email}` : null}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Activity">
          <LineChart
            categories={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
            series={[{ name: "Requests", data: [12, 19, 8, 15, 22, 14, 9] }]}
          />
        </ChartCard>
        <ChartCard title="Breakdown">
          <PieChart
            data={[
              { name: "Queries", value: 42 },
              { name: "Reports", value: 18 },
              { name: "Other", value: 10 },
            ]}
          />
        </ChartCard>
      </div>
    </div>
  );
}

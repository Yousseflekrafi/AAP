import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs, fetchSecurityEvents, type AuditLog, type SecurityEvent } from "../../services/adminService";
import { DataTable, type DataTableColumn } from "../../reusedComponents/DataTable";
import { Pagination } from "../../reusedComponents/Pagination";

const PAGE_SIZE = 20;

type Tab = "logs" | "events";

export default function Audit() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("logs");
  const [page, setPage] = useState(1);

  const logsQuery = useQuery({
    queryKey: ["audit-logs", page],
    queryFn: () => fetchAuditLogs(page),
    enabled: tab === "logs",
  });

  const eventsQuery = useQuery({
    queryKey: ["security-events", page],
    queryFn: () => fetchSecurityEvents(page),
    enabled: tab === "events",
  });

  const logColumns: DataTableColumn<AuditLog>[] = [
    { key: "created_at", header: "Time", render: (r) => new Date(r.created_at).toLocaleString() },
    { key: "user_email", header: "User", render: (r) => r.user_email ?? "—" },
    { key: "method", header: "Method" },
    { key: "path", header: "Path" },
    { key: "status_code", header: "Status" },
    { key: "ip_address", header: "IP" },
  ];

  const eventColumns: DataTableColumn<SecurityEvent>[] = [
    { key: "created_at", header: "Time", render: (r) => new Date(r.created_at).toLocaleString() },
    { key: "user_email", header: "User", render: (r) => r.user_email ?? "—" },
    { key: "event_type", header: "Event" },
    { key: "severity", header: "Severity" },
    { key: "ip_address", header: "IP" },
  ];

  const activeData = tab === "logs" ? logsQuery.data : eventsQuery.data;
  const activeLoading = tab === "logs" ? logsQuery.isLoading : eventsQuery.isLoading;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t("admin.auditLogs")}</h1>

      <div className="flex gap-2">
        {(["logs", "events"] as Tab[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setTab(value);
              setPage(1);
            }}
            className={`px-3 py-2 text-sm font-medium ${
              tab === value
                ? "border-b-2 border-brand-600 text-brand-600"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {value === "logs" ? t("admin.auditLogs") : t("admin.securityEvents")}
          </button>
        ))}
      </div>

      {tab === "logs" ? (
        <DataTable columns={logColumns} rows={logsQuery.data?.results ?? []} rowKey={(r) => r.id} loading={activeLoading} />
      ) : (
        <DataTable columns={eventColumns} rows={eventsQuery.data?.results ?? []} rowKey={(r) => r.id} loading={activeLoading} />
      )}

      <Pagination page={page} pageSize={PAGE_SIZE} totalCount={activeData?.count ?? 0} onPageChange={setPage} />
    </div>
  );
}

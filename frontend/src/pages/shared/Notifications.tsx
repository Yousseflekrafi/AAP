import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../services/notificationsService";
import { DataTable, type DataTableColumn } from "../../reusedComponents/DataTable";
import { Pagination } from "../../reusedComponents/Pagination";
import type { AppNotification } from "../../types/notifications";

const PAGE_SIZE = 20;

export default function Notifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => fetchNotifications(page),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    void queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
  };

  const columns: DataTableColumn<AppNotification>[] = [
    {
      key: "title",
      header: "Notification",
      render: (n) => (
        <div>
          <p className={n.is_read ? "text-gray-500 dark:text-gray-400" : "font-medium text-gray-900 dark:text-gray-100"}>
            {n.title}
          </p>
          {n.body && <p className="text-xs text-gray-400">{n.body}</p>}
        </div>
      ),
    },
    { key: "notif_type", header: "Type" },
    { key: "created_at", header: "Received", render: (n) => new Date(n.created_at).toLocaleString() },
    {
      key: "is_read",
      header: "",
      render: (n) =>
        n.is_read ? (
          <span className="text-xs text-gray-400">Read</span>
        ) : (
          <button
            type="button"
            onClick={async (e) => {
              e.stopPropagation();
              await markNotificationRead(n.id);
              invalidate();
            }}
            className="text-xs text-brand-600 hover:underline"
          >
            Mark read
          </button>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t("nav.notifications")}</h1>
        <button
          type="button"
          onClick={async () => {
            await markAllNotificationsRead();
            invalidate();
          }}
          className="text-sm text-brand-600 hover:underline"
        >
          Mark all read
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={data?.results ?? []}
        rowKey={(n) => n.id}
        loading={isLoading}
        onRowClick={(n) => n.action_url && navigate(n.action_url)}
      />
      <Pagination page={page} pageSize={PAGE_SIZE} totalCount={data?.count ?? 0} onPageChange={setPage} />
    </div>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchUsers } from "../../services/adminService";
import { DataTable, type DataTableColumn } from "../../reusedComponents/DataTable";
import { Pagination } from "../../reusedComponents/Pagination";
import { ErrorState } from "../../reusedComponents/ErrorState";
import { StatusBadge, OnlineDot } from "../../reusedComponents/StatusBadge";
import type { User } from "../../types/auth";

const PAGE_SIZE = 20;

export default function Users() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: () => fetchUsers(page, search),
  });

  const columns: DataTableColumn<User>[] = [
    {
      key: "email",
      header: t("common.email"),
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{row.full_name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.email}</p>
        </div>
      ),
    },
    {
      key: "roles",
      header: "Roles",
      render: (row) => row.roles.join(", ") || "—",
    },
    {
      key: "is_email_verified",
      header: "Verified",
      render: (row) => (row.is_email_verified ? "Yes" : "No"),
    },
    { key: "status", header: t("organization.status"), render: (row) => <StatusBadge status={row.status} /> },
    { key: "is_online", header: t("organization.presence"), render: (row) => <OnlineDot online={row.is_online} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t("nav.users")}</h1>
        <input
          type="search"
          placeholder={t("common.search")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-56 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-1.5 text-sm"
        />
      </div>

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={data?.results ?? []}
            rowKey={(row) => row.id}
            loading={isLoading}
            onRowClick={(row) => navigate(`/admin/users/${row.id}`)}
          />
          <Pagination page={page} pageSize={PAGE_SIZE} totalCount={data?.count ?? 0} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

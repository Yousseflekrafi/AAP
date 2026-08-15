import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { fetchUserDetail, setUserActive, deleteUser } from "../../services/adminService";
import { Breadcrumb } from "../../reusedComponents/Breadcrumb";
import { Loader } from "../../reusedComponents/Loader";
import { ErrorState } from "../../reusedComponents/ErrorState";
import { StatusBadge, OnlineDot } from "../../reusedComponents/StatusBadge";
import { Icon } from "../../reusedComponents/Icon";
import { ConfirmDialog } from "../../reusedComponents/Modal";

export default function UserDetails() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => fetchUserDetail(id as string),
    enabled: !!id,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: () => setUserActive(id as string, user!.status === "deactivated"),
    onSuccess: (updated) => {
      queryClient.setQueryData(["admin-user", id], updated);
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(id as string),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      navigate("/admin/users");
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: t("nav.users"), to: "/admin/users" }, { label: t("admin.userDetails") }]} />

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      )}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {user && (
        <div className="max-w-lg rounded-xl bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 shadow-sm shadow-gray-900/5 dark:shadow-none">
          <dl className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
            <dt className="text-gray-500 dark:text-gray-400">{t("common.email")}</dt>
            <dd className="text-gray-900 dark:text-gray-100">{user.email}</dd>
            <dt className="text-gray-500 dark:text-gray-400">Name</dt>
            <dd className="text-gray-900 dark:text-gray-100">{user.full_name}</dd>
            <dt className="text-gray-500 dark:text-gray-400">Verified</dt>
            <dd className="text-gray-900 dark:text-gray-100">{user.is_email_verified ? "Yes" : "No"}</dd>
            <dt className="text-gray-500 dark:text-gray-400">Provider</dt>
            <dd className="text-gray-900 dark:text-gray-100">{user.auth_provider}</dd>
            <dt className="text-gray-500 dark:text-gray-400">Roles</dt>
            <dd className="text-gray-900 dark:text-gray-100">{user.roles.join(", ") || "—"}</dd>
            <dt className="text-gray-500 dark:text-gray-400">{t("organization.status")}</dt>
            <dd><StatusBadge status={user.status} /></dd>
            <dt className="text-gray-500 dark:text-gray-400">{t("organization.presence")}</dt>
            <dd><OnlineDot online={user.is_online} /></dd>
            <dt className="text-gray-500 dark:text-gray-400">Joined</dt>
            <dd className="text-gray-900 dark:text-gray-100">{new Date(user.created_at).toLocaleDateString()}</dd>
          </dl>

          {user.status !== "deleted" && (
            <div className="mt-6 flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => toggleActiveMutation.mutate()}
                disabled={toggleActiveMutation.isPending}
                className="flex items-center gap-1.5 rounded-md bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-60"
              >
                <Icon name="power" size={14} />
                {user.status === "deactivated" ? t("status.active") : t("status.deactivated")}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-1.5 rounded-md bg-red-50 dark:bg-red-950/30 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-950/50 disabled:opacity-60"
              >
                <Icon name="trash" size={14} />
                {t("status.deleted")}
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        message={`Delete ${user?.email}? This cannot be undone.`}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          deleteMutation.mutate();
        }}
      />
    </div>
  );
}

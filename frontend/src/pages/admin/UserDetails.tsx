import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchUserDetail } from "../../services/adminService";
import { Breadcrumb } from "../../reusedComponents/Breadcrumb";
import { Loader } from "../../reusedComponents/Loader";
import { ErrorState } from "../../reusedComponents/ErrorState";

export default function UserDetails() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => fetchUserDetail(id as string),
    enabled: !!id,
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
        <div className="max-w-lg rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
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
            <dt className="text-gray-500 dark:text-gray-400">Joined</dt>
            <dd className="text-gray-900 dark:text-gray-100">{new Date(user.created_at).toLocaleDateString()}</dd>
          </dl>
        </div>
      )}
    </div>
  );
}

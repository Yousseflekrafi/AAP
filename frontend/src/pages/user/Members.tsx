import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useCurrentOrganization } from "../../hooks/useCurrentOrganization";
import * as organizationsService from "../../services/organizationsService";
import type { OrganizationMember, OrgRole } from "../../types/organization";
import { Loader } from "../../reusedComponents/Loader";
import { ErrorState } from "../../reusedComponents/ErrorState";
import { DataTable } from "../../reusedComponents/DataTable";
import { Icon } from "../../reusedComponents/Icon";
import { useAuth } from "../../hooks/useAuth";

export default function Members() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { organization, loading: orgLoading, error: orgError } = useCurrentOrganization();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["members", organization?.id],
    queryFn: () => organizationsService.fetchMembers(organization!.id),
    enabled: !!organization,
  });
  const members = data?.results ?? [];

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrgRole>("member");

  const inviteMutation = useMutation({
    mutationFn: () => organizationsService.inviteMember(organization!.id, email, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["members", organization?.id] });
      setEmail("");
      setRole("member");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => organizationsService.removeMember(organization!.id, memberId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["members", organization?.id] }),
  });

  const currentMember = members.find((m) => m.user === user?.id);
  const canManage = currentMember?.role === "owner" || currentMember?.role === "admin";

  const inviteErrorDetail =
    inviteMutation.isError && isAxiosError(inviteMutation.error) && inviteMutation.error.response?.data?.detail
      ? String(inviteMutation.error.response.data.detail)
      : inviteMutation.isError
        ? t("common.somethingWentWrong")
        : null;

  if (orgLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader />
      </div>
    );
  }

  if (orgError || !organization) {
    return <ErrorState />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
        <Icon name="users" className="text-blue-600" />
        {t("nav.members")}
      </h1>

      {canManage && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            inviteMutation.mutate();
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <input
            type="email"
            required
            placeholder={t("common.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as OrgRole)}
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          >
            <option value="member">{t("organization.member")}</option>
            <option value="admin">{t("organization.admin")}</option>
          </select>
          <button
            type="submit"
            disabled={inviteMutation.isPending}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {inviteMutation.isPending && <Loader size="sm" className="text-white" />}
            {t("organization.inviteMember")}
          </button>
        </form>
      )}
      {inviteErrorDetail && <p className="text-sm text-red-600">{inviteErrorDetail}</p>}

      <DataTable
        columns={[
          { key: "user_name", header: t("common.email"), render: (m) => `${m.user_name} (${m.user_email})` },
          { key: "role", header: t("organization.role"), render: (m) => t(`organization.${m.role}`) },
          ...(canManage
            ? [
                {
                  key: "actions",
                  header: "",
                  render: (m: OrganizationMember) =>
                    m.role !== "owner" ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Remove ${m.user_email}?`)) removeMutation.mutate(m.id);
                        }}
                        className="text-sm text-red-600 hover:underline"
                      >
                        {t("organization.remove")}
                      </button>
                    ) : null,
                },
              ]
            : []),
        ]}
        rows={members}
        rowKey={(m) => m.id}
        loading={isLoading}
      />
      {isError && <ErrorState onRetry={() => void refetch()} />}
    </div>
  );
}

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
import { Modal } from "../../reusedComponents/Modal";
import { StatusBadge, OnlineDot } from "../../reusedComponents/StatusBadge";
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

  const [modalOpen, setModalOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrgRole>("member");

  const inviteMutation = useMutation({
    mutationFn: () =>
      organizationsService.inviteMember(organization!.id, {
        email,
        first_name: firstName,
        last_name: lastName,
        role,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["members", organization?.id] });
      setModalOpen(false);
      setFirstName("");
      setLastName("");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            <Icon name="users" className="text-brand-600" />
            {t("nav.members")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("organization.teamSubtitle")}</p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Icon name="plus" size={16} />
            {t("organization.addMember")}
          </button>
        )}
      </div>

      <DataTable
        columns={[
          {
            key: "user_name",
            header: t("common.email"),
            render: (m) => (
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{m.user_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{m.user_email}</p>
              </div>
            ),
          },
          { key: "role", header: t("organization.role"), render: (m) => t(`organization.${m.role}`) },
          { key: "user_status", header: t("organization.status"), render: (m) => <StatusBadge status={m.user_status} /> },
          { key: "is_online", header: t("organization.presence"), render: (m) => <OnlineDot online={m.is_online} /> },
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
                        className="flex items-center gap-1 text-sm text-red-600 hover:underline"
                      >
                        <Icon name="trash" size={14} />
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t("organization.addMember")}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            inviteMutation.mutate();
          }}
          className="flex flex-col gap-4"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("organization.addMemberHelp")}</p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder={t("auth.firstName")}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-1/2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder={t("auth.lastName")}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-1/2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div className="relative">
            <Icon name="mail" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              required
              placeholder={t("common.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as OrgRole)}
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          >
            <option value="member">{t("organization.member")}</option>
            <option value="admin">{t("organization.admin")}</option>
          </select>
          {inviteErrorDetail && <p className="text-sm text-red-600">{inviteErrorDetail}</p>}
          <button
            type="submit"
            disabled={inviteMutation.isPending}
            className="flex items-center justify-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {inviteMutation.isPending && <Loader size="sm" className="text-white" />}
            {t("organization.addMember")}
          </button>
        </form>
      </Modal>
    </div>
  );
}

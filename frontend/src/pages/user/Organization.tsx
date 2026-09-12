import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as organizationsService from "../../services/organizationsService";
import { Loader } from "../../reusedComponents/Loader";
import { ErrorState } from "../../reusedComponents/ErrorState";
import { Icon } from "../../reusedComponents/Icon";
import { useAuth } from "../../hooks/useAuth";
import { usePermission } from "../../hooks/usePermission";

export default function OrganizationPage() {
  const { data: organization, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-organizations"],
    queryFn: organizationsService.fetchMyOrganizations,
    select: (data) => data.results[0] ?? null,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader />
      </div>
    );
  }

  if (isError || !organization) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  return <OrganizationForm key={organization.id} organizationId={organization.id} />;
}

function OrganizationForm({ organizationId }: { organizationId: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canEditPlatform = usePermission("org.edit");

  const { data: organization } = useQuery({
    queryKey: ["my-organizations"],
    queryFn: organizationsService.fetchMyOrganizations,
    select: (data) => data.results.find((o) => o.id === organizationId)!,
  });

  const { data: members } = useQuery({
    queryKey: ["members", organizationId],
    queryFn: () => organizationsService.fetchMembers(organizationId),
  });
  const currentMember = members?.results.find((m) => m.user === user?.id);
  // Org owners/admins edit their own organization; platform admin/super_admin
  // (org.edit) can additionally edit any organization.
  const canEdit = currentMember?.role === "owner" || currentMember?.role === "admin" || canEditPlatform;

  const [name, setName] = useState(organization!.name);
  const [website, setWebsite] = useState(organization!.website);
  const [country, setCountry] = useState(organization!.country);
  const [industry, setIndustry] = useState(organization!.industry);

  const saveMutation = useMutation({
    mutationFn: () => organizationsService.updateOrganization(organizationId, { name, website, country, industry }),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        ["my-organizations"],
        (prev: Awaited<ReturnType<typeof organizationsService.fetchMyOrganizations>> | undefined) =>
          prev ? { ...prev, results: prev.results.map((o) => (o.id === updated.id ? updated : o)) } : prev,
      );
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
        <Icon name="building" className="text-brand-600" />
        {t("organization.profile")}
      </h1>

      {!organization!.is_profile_complete && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 shadow-sm shadow-amber-900/5 dark:shadow-none px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          {t("organization.incompleteWarning")}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
        className="flex max-w-md flex-col gap-4"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("project.name")}
          disabled={!canEdit}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800/60"
        />
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder={t("organization.website")}
          disabled={!canEdit}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800/60"
        />
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder={t("organization.country")}
          disabled={!canEdit}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800/60"
        />
        <input
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder={t("organization.industry")}
          disabled={!canEdit}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800/60"
        />
        {saveMutation.isSuccess && <p className="text-sm text-gray-600 dark:text-gray-300">{t("common.save")}</p>}
        {saveMutation.isError && <p className="text-sm text-red-600">{t("common.somethingWentWrong")}</p>}
        {canEdit && (
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="flex items-center justify-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-700 disabled:opacity-60"
          >
            {saveMutation.isPending && <Loader size="sm" className="text-white" />}
            {t("common.save")}
          </button>
        )}
      </form>
    </div>
  );
}

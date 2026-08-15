import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentOrganization } from "../../hooks/useCurrentOrganization";
import * as projectsService from "../../services/projectsService";
import type { ProjectEnvironment } from "../../types/project";
import { Loader } from "../../reusedComponents/Loader";
import { EmptyState } from "../../reusedComponents/EmptyState";
import { ErrorState } from "../../reusedComponents/ErrorState";
import { Modal } from "../../reusedComponents/Modal";
import { Icon } from "../../reusedComponents/Icon";

const ENV_BADGE: Record<ProjectEnvironment, string> = {
  development: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  staging: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  production: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
};

export default function Projects() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { organization, loading: orgLoading, error: orgError } = useCurrentOrganization();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["projects", organization?.id],
    queryFn: () => projectsService.fetchProjects(organization!.id),
    enabled: !!organization,
  });
  const projects = data?.results ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [environment, setEnvironment] = useState<ProjectEnvironment>("development");
  const [contextDescription, setContextDescription] = useState("");

  const createMutation = useMutation({
    mutationFn: () =>
      projectsService.createProject(organization!.id, {
        name,
        description,
        application_url: applicationUrl,
        environment,
        context_description: contextDescription,
      }),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: ["projects", organization?.id] });
      setModalOpen(false);
      navigate(`/projects/${project.id}`);
    },
  });

  if (orgLoading || isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader />
      </div>
    );
  }

  if (orgError || isError) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t("nav.projects")}</h1>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Icon name="plus" size={16} />
          {t("project.newProject")}
        </button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title={t("project.noProjects")}
          description={t("project.noProjectsBody")}
          action={
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-2 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              {t("project.newProject")}
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="flex h-full flex-col gap-3 rounded-xl bg-white dark:bg-gray-900 p-4 text-left border border-gray-200 dark:border-gray-800 shadow-sm shadow-gray-900/5 dark:shadow-none hover:shadow-md hover:shadow-gray-900/10 dark:hover:bg-gray-800 transition-shadow"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
                  <Icon name="folder" size={16} />
                </span>
                <span className="truncate font-medium text-gray-900 dark:text-gray-100">{project.name}</span>
              </div>
              <p className="line-clamp-2 min-h-[2.5rem] text-sm text-gray-500 dark:text-gray-400">
                {project.description || <span className="italic text-gray-400 dark:text-gray-600">{t("project.noDescription")}</span>}
              </p>
              <div className="mt-auto flex items-center justify-between pt-1">
                <span
                  className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${ENV_BADGE[project.environment]}`}
                >
                  {t(`project.${project.environment}`)}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(project.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t("project.newProject")}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="flex flex-col gap-4"
        >
          <input
            type="text"
            required
            placeholder={t("project.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          <textarea
            placeholder={t("project.description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          <input
            type="url"
            placeholder={t("project.applicationUrl")}
            value={applicationUrl}
            onChange={(e) => setApplicationUrl(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as ProjectEnvironment)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="development">{t("project.development")}</option>
            <option value="staging">{t("project.staging")}</option>
            <option value="production">{t("project.production")}</option>
          </select>
          <div>
            <textarea
              placeholder={t("project.contextDescription")}
              value={contextDescription}
              onChange={(e) => setContextDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("project.contextDescriptionHelp")}</p>
          </div>
          {createMutation.isError && <p className="text-sm text-red-600">{t("common.somethingWentWrong")}</p>}
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center justify-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {createMutation.isPending && <Loader size="sm" className="text-white" />}
            {t("common.submit")}
          </button>
        </form>
      </Modal>
    </div>
  );
}

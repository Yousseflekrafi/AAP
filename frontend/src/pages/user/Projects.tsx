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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="flex flex-col gap-2 rounded-lg border border-gray-200 dark:border-gray-800 p-4 text-left hover:border-brand-400 dark:hover:border-brand-600"
            >
              <div className="flex items-center gap-2">
                <Icon name="folder" size={18} className="text-brand-600" />
                <span className="font-medium text-gray-900 dark:text-gray-100">{project.name}</span>
              </div>
              {project.description && (
                <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
              )}
              <span className="mt-1 w-fit rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300">
                {t(`project.${project.environment}`)}
              </span>
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
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          />
          <textarea
            placeholder={t("project.description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          />
          <input
            type="url"
            placeholder={t("project.applicationUrl")}
            value={applicationUrl}
            onChange={(e) => setApplicationUrl(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          />
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as ProjectEnvironment)}
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
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
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
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

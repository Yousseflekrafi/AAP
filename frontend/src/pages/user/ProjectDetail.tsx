import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import * as projectsService from "../../services/projectsService";
import * as connectionsService from "../../services/connectionsService";
import type { Project, ProjectEnvironment } from "../../types/project";
import type { ChartConfig, TableAdminConfig } from "../../types/project";
import type { DatabaseColumn, DatabaseTable } from "../../types/connection";
import { Loader } from "../../reusedComponents/Loader";
import { ErrorState } from "../../reusedComponents/ErrorState";
import { Icon } from "../../reusedComponents/Icon";
import { ConfirmDialog } from "../../reusedComponents/Modal";

type Tab = "overview" | "database" | "dataAccess" | "adminBuilder" | "settings";

export default function ProjectDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");

  const { data: project, isLoading, isError, refetch } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsService.fetchProject(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader />
      </div>
    );
  }

  if (isError || !project) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview", label: t("project.overview") },
    { key: "database", label: t("project.database") },
    { key: "dataAccess", label: t("project.dataAccess") },
    { key: "adminBuilder", label: t("project.adminBuilder") },
    { key: "settings", label: t("project.settings") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="mb-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ← {t("nav.projects")}
        </button>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          <Icon name="folder" className="text-brand-600" />
          {project.name}
        </h1>
      </div>

      <div className="flex gap-1">
        {TABS.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => setTab(tb.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              tab === tb.key
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab project={project} />}
      {tab === "database" && <DatabaseTab project={project} />}
      {tab === "dataAccess" && <DataAccessTab project={project} />}
      {tab === "adminBuilder" && <AdminBuilderTab project={project} />}
      {tab === "settings" && <SettingsTab project={project} onDeleted={() => navigate("/projects")} />}
    </div>
  );
}

function OverviewTab({ project }: { project: Project }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white dark:bg-gray-900 p-5 border border-gray-200 dark:border-gray-800 shadow-sm shadow-gray-900/5 dark:shadow-none">
      {project.description && <p className="text-sm text-gray-700 dark:text-gray-300">{project.description}</p>}
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase text-gray-400">{t("project.environment")}</dt>
          <dd className="text-sm text-gray-800 dark:text-gray-200">{t(`project.${project.environment}`)}</dd>
        </div>
        {project.application_url && (
          <div>
            <dt className="text-xs uppercase text-gray-400">{t("project.applicationUrl")}</dt>
            <dd className="text-sm text-gray-800 dark:text-gray-200">{project.application_url}</dd>
          </div>
        )}
        {project.context_description && (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase text-gray-400">{t("project.contextDescription")}</dt>
            <dd className="text-sm text-gray-800 dark:text-gray-200">{project.context_description}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

function DatabaseTab({ project }: { project: Project }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: connectionsData, isLoading } = useQuery({
    queryKey: ["connections", project.id],
    queryFn: () => connectionsService.fetchConnections(project.id),
  });
  const connection = connectionsData?.results[0] ?? null;

  const { data: schema, refetch: refetchSchema } = useQuery({
    queryKey: ["schema", connection?.id],
    queryFn: () => connectionsService.fetchSchema(connection!.id),
    enabled: !!connection,
    retry: false,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", host: "", port: 5432, database: "", username: "", password: "" });
  const [testResult, setTestResult] = useState<{ ok: boolean; detail: string } | null>(null);

  const createMutation = useMutation({
    mutationFn: () => connectionsService.createConnection(project.id, form),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["connections", project.id] });
      setFormOpen(false);
    },
    onError: (err) => {
      if (isAxiosError(err) && err.response?.data?.error?.message) {
        setTestResult({ ok: false, detail: String(err.response.data.error.message) });
      }
    },
  });

  const testMutation = useMutation({
    mutationFn: () => connectionsService.testConnection(connection!.id),
    onSuccess: (result) => setTestResult(result),
  });

  const discoverMutation = useMutation({
    mutationFn: () => connectionsService.discoverSchema(connection!.id),
    onSuccess: () => void refetchSchema(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader />
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("project.noConnection")}</p>
        {!formOpen ? (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="w-fit rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {t("project.connection")}
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            className="flex max-w-md flex-col gap-3"
          >
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <input
              required
              placeholder="Host"
              value={form.host}
              onChange={(e) => setForm({ ...form, host: e.target.value })}
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <input
              required
              type="number"
              placeholder="Port"
              value={form.port}
              onChange={(e) => setForm({ ...form, port: Number(e.target.value) })}
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <input
              required
              placeholder="Database"
              value={form.database}
              onChange={(e) => setForm({ ...form, database: e.target.value })}
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <input
              required
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <input
              required
              type="password"
              placeholder={t("common.password")}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            {testResult && !testResult.ok && <p className="text-sm text-red-600">{testResult.detail}</p>}
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center justify-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {createMutation.isPending && <Loader size="sm" className="text-white" />}
              {t("common.submit")}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800 shadow-sm shadow-gray-900/5 dark:shadow-none">
        <Icon name="database" className="text-brand-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{connection.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {connection.host}:{connection.port}/{connection.database}
          </p>
        </div>
        <button
          type="button"
          onClick={() => testMutation.mutate()}
          disabled={testMutation.isPending}
          className="rounded-md bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {t("project.testConnection")}
        </button>
        <button
          type="button"
          onClick={() => discoverMutation.mutate()}
          disabled={discoverMutation.isPending}
          className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          {t("project.discoverSchema")}
        </button>
      </div>

      {testResult && (
        <p className={`text-sm ${testResult.ok ? "text-green-600" : "text-red-600"}`}>
          {testResult.ok ? t("project.connectionOk") : t("project.connectionFailed")}
          {testResult.detail ? ` — ${testResult.detail}` : ""}
        </p>
      )}

      {schema && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800 shadow-sm shadow-gray-900/5 dark:shadow-none">
            <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              {t("project.tables")} ({schema.tables.length})
            </p>
            <ul className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
              {schema.tables.map((tbl) => (
                <li key={tbl.id}>{tbl.name}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-white dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800 shadow-sm shadow-gray-900/5 dark:shadow-none">
            <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              {t("project.relationships")} ({schema.relationships.length})
            </p>
            <ul className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
              {schema.relationships.map((rel) => (
                <li key={rel.id}>
                  {rel.from_table}.{rel.from_column} → {rel.to_table}.{rel.to_column}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function useProjectSchema(projectId: string) {
  const { data: connectionsData, isLoading: connectionsLoading } = useQuery({
    queryKey: ["connections", projectId],
    queryFn: () => connectionsService.fetchConnections(projectId),
  });
  const connection = connectionsData?.results[0] ?? null;

  const schemaQuery = useQuery({
    queryKey: ["schema", connection?.id],
    queryFn: () => connectionsService.fetchSchema(connection!.id),
    enabled: !!connection,
    retry: false,
  });

  return { ...schemaQuery, connection, isLoading: connectionsLoading || schemaQuery.isLoading };
}

function DataAccessTab({ project }: { project: Project }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { connection, data: schema, isLoading } = useProjectSchema(project.id);
  const [expanded, setExpanded] = useState<string | null>(null);

  const invalidateSchema = () => void queryClient.invalidateQueries({ queryKey: ["schema", connection?.id] });

  const toggleTableMutation = useMutation({
    mutationFn: ({ tableId, isSelected }: { tableId: string; isSelected: boolean }) =>
      connectionsService.setTableSelected(tableId, isSelected),
    onSuccess: invalidateSchema,
  });

  const toggleColumnMutation = useMutation({
    mutationFn: ({ columnId, isAllowed }: { columnId: string; isAllowed: boolean }) =>
      connectionsService.setColumnAllowed(columnId, isAllowed),
    onSuccess: invalidateSchema,
  });

  const recommendMutation = useMutation({
    mutationFn: () => connectionsService.recommendSelection(connection!.id),
    onSuccess: invalidateSchema,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader />
      </div>
    );
  }

  if (!connection || !schema) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">{t("project.noConnection")}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("project.dataAccessHelp")}</p>
        <button
          type="button"
          onClick={() => recommendMutation.mutate()}
          disabled={recommendMutation.isPending}
          className="flex items-center gap-1.5 rounded-md bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-60"
        >
          {recommendMutation.isPending && <Loader size="sm" />}
          {t("project.recommend")}
        </button>
      </div>

      <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm shadow-gray-900/5 dark:shadow-none">
        {schema.tables.map((tbl: DatabaseTable) => (
          <div key={tbl.id} className="border-b border-gray-100 dark:border-gray-800/60 last:border-0">
            <div className="flex items-center gap-3 px-4 py-3">
              <input
                type="checkbox"
                checked={tbl.is_selected}
                onChange={(e) => toggleTableMutation.mutate({ tableId: tbl.id, isSelected: e.target.checked })}
                className="h-4 w-4 accent-brand-600"
              />
              <button
                type="button"
                onClick={() => setExpanded(expanded === tbl.id ? null : tbl.id)}
                className="flex flex-1 items-center justify-between text-left"
              >
                <span className={`text-sm font-medium ${tbl.is_selected ? "text-gray-900 dark:text-gray-100" : "text-gray-400 line-through"}`}>
                  {tbl.name}
                </span>
                <span className="text-xs text-gray-400">
                  {tbl.columns.length} {t("project.columns")}
                </span>
              </button>
            </div>
            {expanded === tbl.id && (
              <div className="flex flex-col gap-1.5 bg-gray-50 dark:bg-gray-800/40 px-4 py-3 pl-11">
                {tbl.columns.map((col: DatabaseColumn) => (
                  <label key={col.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={col.is_allowed}
                      onChange={(e) => toggleColumnMutation.mutate({ columnId: col.id, isAllowed: e.target.checked })}
                      className="h-3.5 w-3.5 accent-brand-600"
                    />
                    <span className={col.is_allowed ? "text-gray-700 dark:text-gray-300" : "text-gray-400 line-through"}>
                      {col.name}
                    </span>
                    <span className="text-xs text-gray-400">{col.data_type}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const EMPTY_TABLE_CONFIG: TableAdminConfig = { filters: [], form_fields: [], charts: [] };

function AdminBuilderTab({ project }: { project: Project }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { connection, data: schema, isLoading } = useProjectSchema(project.id);
  const [config, setConfig] = useState(project.admin_config);
  const [syncedConfig, setSyncedConfig] = useState(project.admin_config);

  if (project.admin_config !== syncedConfig) {
    setSyncedConfig(project.admin_config);
    setConfig(project.admin_config);
  }

  const saveMutation = useMutation({
    mutationFn: () => projectsService.updateAdminConfig(project.id, config),
    onSuccess: (updated) => queryClient.setQueryData(["project", project.id], updated),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader />
      </div>
    );
  }

  if (!connection || !schema) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">{t("project.noConnection")}</p>;
  }

  const selectedTables = schema.tables.filter((tbl: DatabaseTable) => tbl.is_selected);

  if (selectedTables.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">{t("project.noTablesSelected")}</p>;
  }

  const updateTableConfig = (tableId: string, patch: Partial<TableAdminConfig>) => {
    setConfig((prev) => ({
      ...prev,
      [tableId]: { ...EMPTY_TABLE_CONFIG, ...prev[tableId], ...patch },
    }));
  };

  const toggleInList = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("project.adminBuilderHelp")}</p>
        <button
          type="button"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {saveMutation.isPending && <Loader size="sm" className="text-white" />}
          {t("common.save")}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {selectedTables.map((tbl: DatabaseTable) => {
          const tableConfig = config[tbl.id] ?? EMPTY_TABLE_CONFIG;
          const allowedColumns = tbl.columns.filter((c: DatabaseColumn) => c.is_allowed);
          const numericColumns = allowedColumns.filter((c: DatabaseColumn) =>
            /int|numeric|float|double|decimal/i.test(c.data_type),
          );
          const chart: ChartConfig | undefined = tableConfig.charts[0];

          return (
            <div key={tbl.id} className="rounded-xl bg-white dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800 shadow-sm shadow-gray-900/5 dark:shadow-none">
              <p className="mb-3 flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                <Icon name="folder" size={16} className="text-brand-600" />
                {tbl.name}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">{t("project.filters")}</p>
                  <div className="flex flex-col gap-1">
                    {allowedColumns.map((col: DatabaseColumn) => (
                      <label key={col.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={tableConfig.filters.includes(col.name)}
                          onChange={() => updateTableConfig(tbl.id, { filters: toggleInList(tableConfig.filters, col.name) })}
                          className="h-3.5 w-3.5 accent-brand-600"
                        />
                        {col.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">{t("project.formFields")}</p>
                  <div className="flex flex-col gap-1">
                    {allowedColumns.map((col: DatabaseColumn) => (
                      <label key={col.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={tableConfig.form_fields.includes(col.name)}
                          onChange={() =>
                            updateTableConfig(tbl.id, { form_fields: toggleInList(tableConfig.form_fields, col.name) })
                          }
                          className="h-3.5 w-3.5 accent-brand-600"
                        />
                        {col.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">{t("project.chart")}</p>
                  {numericColumns.length === 0 ? (
                    <p className="text-xs text-gray-400">{t("project.noNumericColumns")}</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <select
                        value={chart?.type ?? ""}
                        onChange={(e) => {
                          const type = e.target.value as ChartConfig["type"] | "";
                          updateTableConfig(tbl.id, {
                            charts: type ? [{ type, column: chart?.column ?? numericColumns[0].name }] : [],
                          });
                        }}
                        className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="">{t("project.noChart")}</option>
                        <option value="bar">Bar</option>
                        <option value="line">Line</option>
                        <option value="pie">Pie</option>
                      </select>
                      {chart && (
                        <select
                          value={chart.column}
                          onChange={(e) =>
                            updateTableConfig(tbl.id, { charts: [{ type: chart.type, column: e.target.value }] })
                          }
                          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        >
                          {numericColumns.map((col: DatabaseColumn) => (
                            <option key={col.id} value={col.name}>
                              {col.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsTab({ project, onDeleted }: { project: Project; onDeleted: () => void }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [applicationUrl, setApplicationUrl] = useState(project.application_url);
  const [environment, setEnvironment] = useState<ProjectEnvironment>(project.environment);
  const [contextDescription, setContextDescription] = useState(project.context_description);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const saveMutation = useMutation({
    mutationFn: () =>
      projectsService.updateProject(project.id, {
        name,
        description,
        application_url: applicationUrl,
        environment,
        context_description: contextDescription,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["project", project.id], updated);
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => projectsService.deleteProject(project.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      onDeleted();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        saveMutation.mutate();
      }}
      className="flex max-w-md flex-col gap-4"
    >
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("project.name")}
        className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        placeholder={t("project.description")}
        className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      />
      <input
        value={applicationUrl}
        onChange={(e) => setApplicationUrl(e.target.value)}
        placeholder={t("project.applicationUrl")}
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
      <textarea
        value={contextDescription}
        onChange={(e) => setContextDescription(e.target.value)}
        rows={3}
        placeholder={t("project.contextDescription")}
        className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      />
      {saveMutation.isSuccess && <p className="text-sm text-gray-600 dark:text-gray-300">{t("common.save")}</p>}
      {saveMutation.isError && <p className="text-sm text-red-600">{t("common.somethingWentWrong")}</p>}
      <button
        type="submit"
        disabled={saveMutation.isPending}
        className="flex items-center justify-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {saveMutation.isPending && <Loader size="sm" className="text-white" />}
        {t("common.save")}
      </button>
      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        className="w-fit text-sm text-red-600 hover:underline"
      >
        {t("organization.remove")}
      </button>

      <ConfirmDialog
        open={confirmDelete}
        message={`Delete "${project.name}"? This cannot be undone.`}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          deleteMutation.mutate();
        }}
      />
    </form>
  );
}

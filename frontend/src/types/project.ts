export type ProjectEnvironment = "development" | "staging" | "production";

export interface ChartConfig {
  type: "bar" | "line" | "pie";
  column: string;
}

export interface TableAdminConfig {
  filters: string[];
  form_fields: string[];
  charts: ChartConfig[];
}

export type AdminConfig = Record<string, TableAdminConfig>;

export interface Project {
  id: string;
  organization: string;
  name: string;
  slug: string;
  description: string;
  application_url: string;
  environment: ProjectEnvironment;
  context_description: string;
  admin_config: AdminConfig;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

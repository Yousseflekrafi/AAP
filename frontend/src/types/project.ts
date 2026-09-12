export type ProjectEnvironment = "development" | "staging" | "production";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export interface ChartConfig {
  type: "bar" | "line" | "pie";
  column: string;
}

export interface TableAdminConfig {
  filters: string[];
  form_fields: string[];
  charts: ChartConfig[];
  allowed_methods: HttpMethod[];
}

export type AdminConfig = Record<string, TableAdminConfig>;

export type ButtonStyle = "rounded" | "square" | "pill";
export type InputStyle = "outlined" | "filled";
export type DefaultChartType = "bar" | "line" | "pie";

export interface PanelStyle {
  primary_color: string;
  background_color: string;
  logo_url: string;
  button_style: ButtonStyle;
  input_style: InputStyle;
  default_chart_type: DefaultChartType;
}

export const DEFAULT_PANEL_STYLE: PanelStyle = {
  primary_color: "#4f46e5",
  background_color: "#f5f5f9",
  logo_url: "",
  button_style: "rounded",
  input_style: "outlined",
  default_chart_type: "bar",
};

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
  panel_style: Partial<PanelStyle>;
  is_published: boolean;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublishResult {
  application: Project;
  api_key: string | null;
  embed_script: string | null;
  note: string;
}

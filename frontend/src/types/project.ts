export type ProjectEnvironment = "development" | "staging" | "production";

export interface Project {
  id: string;
  organization: string;
  name: string;
  slug: string;
  description: string;
  application_url: string;
  environment: ProjectEnvironment;
  context_description: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

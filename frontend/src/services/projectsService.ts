import { apiClient } from "./apiClient";
import type { Paginated } from "./adminService";
import type { AdminConfig, Project } from "../types/project";

export interface CreateProjectPayload {
  name: string;
  description?: string;
  application_url?: string;
  environment?: Project["environment"];
  context_description?: string;
}

export async function fetchProjects(orgId: string): Promise<Paginated<Project>> {
  const { data } = await apiClient.get<Paginated<Project>>(`/organizations/${orgId}/projects/`);
  return data;
}

export async function createProject(orgId: string, payload: CreateProjectPayload): Promise<Project> {
  const { data } = await apiClient.post<Project>(`/organizations/${orgId}/projects/`, payload);
  return data;
}

export async function fetchProject(id: string): Promise<Project> {
  const { data } = await apiClient.get<Project>(`/projects/${id}/`);
  return data;
}

export async function updateProject(id: string, payload: Partial<CreateProjectPayload>): Promise<Project> {
  const { data } = await apiClient.patch<Project>(`/projects/${id}/`, payload);
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/projects/${id}/`);
}

export async function updateAdminConfig(id: string, adminConfig: AdminConfig): Promise<Project> {
  const { data } = await apiClient.patch<Project>(`/projects/${id}/`, { admin_config: adminConfig });
  return data;
}

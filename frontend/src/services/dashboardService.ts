import { apiClient } from "./apiClient";

export interface PlatformStats {
  organizations: { total: number; active: number; suspended: number };
  users: { total: number; active: number; pending_verification: number };
  applications: { total: number };
  connections: { total: number; failing: number };
  security: { events_last_24h: number; critical_events_last_24h: number };
  admin_messages: { open: number };
}

export interface OrgStats {
  organizations: number;
  members: number;
  applications: number;
  connections: { total: number; failing: number };
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  const { data } = await apiClient.get<PlatformStats>("/auth/dashboard/platform-stats/");
  return data;
}

export async function fetchOrgStats(): Promise<OrgStats> {
  const { data } = await apiClient.get<OrgStats>("/auth/dashboard/org-stats/");
  return data;
}

export interface OrganizationStats {
  projects: { total: number; by_environment: Record<string, number> };
  members: { total: number; by_role: Record<string, number>; online: number };
  connections: { total: number; ok: number; failing: number; untested: number };
}

export async function fetchOrganizationStats(organizationId: string): Promise<OrganizationStats> {
  const { data } = await apiClient.get<OrganizationStats>(`/organizations/${organizationId}/stats/`);
  return data;
}

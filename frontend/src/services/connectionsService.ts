import { apiClient } from "./apiClient";
import type { Paginated } from "./adminService";
import type { DatabaseColumn, DatabaseConnection, DatabaseSchema, DatabaseTable } from "../types/connection";

export interface ConnectionPayload {
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string;
  is_read_only?: boolean;
}

export async function fetchConnections(projectId: string): Promise<Paginated<DatabaseConnection>> {
  const { data } = await apiClient.get<Paginated<DatabaseConnection>>(`/projects/${projectId}/connections/`);
  return data;
}

export async function createConnection(projectId: string, payload: ConnectionPayload): Promise<DatabaseConnection> {
  const { data } = await apiClient.post<DatabaseConnection>(`/projects/${projectId}/connections/`, payload);
  return data;
}

export async function testConnection(connectionId: string): Promise<{ ok: boolean; detail: string }> {
  const { data } = await apiClient.post<{ ok: boolean; detail: string }>(`/connections/${connectionId}/test/`);
  return data;
}

export async function discoverSchema(connectionId: string): Promise<{ schema: string; tables: number; columns: number; relationships: number }> {
  const { data } = await apiClient.post(`/connections/${connectionId}/discover-schema/`);
  return data;
}

export async function fetchSchema(connectionId: string): Promise<DatabaseSchema> {
  const { data } = await apiClient.get<DatabaseSchema>(`/connections/${connectionId}/schema/`);
  return data;
}

export async function recommendSelection(connectionId: string): Promise<DatabaseSchema> {
  const { data } = await apiClient.post<DatabaseSchema>(`/connections/${connectionId}/recommend/`);
  return data;
}

export async function setTableSelected(tableId: string, isSelected: boolean): Promise<DatabaseTable> {
  const { data } = await apiClient.patch<DatabaseTable>(`/schema-tables/${tableId}/`, { is_selected: isSelected });
  return data;
}

export async function setColumnAllowed(columnId: string, isAllowed: boolean): Promise<DatabaseColumn> {
  const { data } = await apiClient.patch<DatabaseColumn>(`/schema-columns/${columnId}/`, { is_allowed: isAllowed });
  return data;
}

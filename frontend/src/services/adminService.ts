import { apiClient } from "./apiClient";
import type { User } from "../types/auth";

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuditLog {
  id: string;
  user: string | null;
  user_email: string | null;
  action: string;
  method: string;
  path: string;
  status_code: number;
  ip_address: string | null;
  created_at: string;
}

export interface SecurityEvent {
  id: string;
  user: string | null;
  user_email: string | null;
  event_type: string;
  severity: "info" | "warning" | "critical";
  ip_address: string | null;
  description: string;
  created_at: string;
}

export async function fetchUsers(page = 1, search = ""): Promise<Paginated<User>> {
  const { data } = await apiClient.get<Paginated<User>>("/auth/users/", {
    params: { page, search: search || undefined },
  });
  return data;
}

export async function fetchUserDetail(id: string): Promise<User> {
  const { data } = await apiClient.get<User>(`/auth/users/${id}/`);
  return data;
}

export async function fetchAuditLogs(page = 1): Promise<Paginated<AuditLog>> {
  const { data } = await apiClient.get<Paginated<AuditLog>>("/audit/logs/", { params: { page } });
  return data;
}

export async function fetchSecurityEvents(page = 1): Promise<Paginated<SecurityEvent>> {
  const { data } = await apiClient.get<Paginated<SecurityEvent>>("/audit/security-events/", { params: { page } });
  return data;
}

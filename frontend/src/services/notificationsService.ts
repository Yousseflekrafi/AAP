import { apiClient } from "./apiClient";
import type { Paginated } from "./adminService";
import type { AppNotification } from "../types/notifications";

export async function fetchNotifications(page = 1): Promise<Paginated<AppNotification>> {
  const { data } = await apiClient.get<Paginated<AppNotification>>("/notifications/", { params: { page } });
  return data;
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<{ unread_count: number }>("/notifications/unread-count/");
  return data.unread_count;
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  const { data } = await apiClient.post<AppNotification>(`/notifications/${id}/read/`);
  return data;
}

export async function markAllNotificationsRead(): Promise<{ marked_read: number }> {
  const { data } = await apiClient.post<{ marked_read: number }>("/notifications/read-all/");
  return data;
}

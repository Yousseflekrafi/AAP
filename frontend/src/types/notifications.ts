export type NotificationType =
  | "account"
  | "security"
  | "organization"
  | "application"
  | "connection"
  | "ai"
  | "query"
  | "administration"
  | "system";

export interface AppNotification {
  id: string;
  notif_type: NotificationType;
  title: string;
  body: string;
  action_url: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

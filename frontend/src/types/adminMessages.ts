export type ConversationStatus =
  | "open"
  | "in_progress"
  | "waiting_for_admin"
  | "waiting_for_super_admin"
  | "resolved"
  | "closed";

export type ConversationPriority = "low" | "normal" | "high" | "critical";

export interface AdminConversation {
  id: string;
  organization: string | null;
  created_by: string;
  created_by_email: string;
  created_by_name: string;
  target_user: string | null;
  target_user_email: string | null;
  target_user_name: string | null;
  assigned_to: string | null;
  assigned_to_email: string | null;
  subject: string;
  status: ConversationStatus;
  priority: ConversationPriority;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationRecipient {
  id: string;
  email: string;
  name: string;
  subtitle: string;
}

export interface AdminMessage {
  id: string;
  conversation: string;
  sender: string;
  sender_email: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

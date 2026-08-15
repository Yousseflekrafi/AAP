import { apiClient } from "./apiClient";
import type { Paginated } from "./adminService";
import type {
  AdminConversation,
  AdminMessage,
  ConversationRecipient,
  ConversationStatus,
} from "../types/adminMessages";

export async function fetchRecipients(): Promise<ConversationRecipient[]> {
  const { data } = await apiClient.get<ConversationRecipient[]>("/admin-messages/recipients/");
  return data;
}

export async function fetchConversations(page = 1): Promise<Paginated<AdminConversation>> {
  const { data } = await apiClient.get<Paginated<AdminConversation>>("/admin-messages/conversations/", {
    params: { page },
  });
  return data;
}

export async function fetchConversation(id: string): Promise<AdminConversation> {
  const { data } = await apiClient.get<AdminConversation>(`/admin-messages/conversations/${id}/`);
  return data;
}

export async function createConversation(subject: string, targetUserId?: string): Promise<AdminConversation> {
  const { data } = await apiClient.post<AdminConversation>("/admin-messages/conversations/", {
    subject,
    target_user: targetUserId ?? null,
  });
  return data;
}

export async function closeConversation(id: string, status: ConversationStatus): Promise<AdminConversation> {
  const { data } = await apiClient.post<AdminConversation>(`/admin-messages/conversations/${id}/close/`, { status });
  return data;
}

export async function fetchMessages(conversationId: string): Promise<Paginated<AdminMessage>> {
  const { data } = await apiClient.get<Paginated<AdminMessage>>(
    `/admin-messages/conversations/${conversationId}/messages/`,
  );
  return data;
}

export async function sendMessage(conversationId: string, message: string): Promise<AdminMessage> {
  const { data } = await apiClient.post<AdminMessage>(
    `/admin-messages/conversations/${conversationId}/messages/`,
    { message },
  );
  return data;
}

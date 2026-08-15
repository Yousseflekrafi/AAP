import { apiClient } from "./apiClient";
import type { Paginated } from "./adminService";
import type { Organization, OrganizationMember, OrganizationMessage, OrgRole } from "../types/organization";

export async function fetchMyOrganizations(): Promise<Paginated<Organization>> {
  const { data } = await apiClient.get<Paginated<Organization>>("/organizations/");
  return data;
}

export async function fetchOrganization(id: string): Promise<Organization> {
  const { data } = await apiClient.get<Organization>(`/organizations/${id}/`);
  return data;
}

export async function updateOrganization(id: string, payload: Partial<Organization>): Promise<Organization> {
  const { data } = await apiClient.patch<Organization>(`/organizations/${id}/`, payload);
  return data;
}

export async function fetchMembers(orgId: string): Promise<Paginated<OrganizationMember>> {
  const { data } = await apiClient.get<Paginated<OrganizationMember>>(`/organizations/${orgId}/members/`);
  return data;
}

export interface InviteMemberPayload {
  email: string;
  first_name?: string;
  last_name?: string;
  role?: OrgRole;
}

export async function inviteMember(orgId: string, payload: InviteMemberPayload): Promise<OrganizationMember> {
  const { data } = await apiClient.post<OrganizationMember>(`/organizations/${orgId}/members/`, payload);
  return data;
}

export async function removeMember(orgId: string, memberId: string): Promise<void> {
  await apiClient.delete(`/organizations/${orgId}/members/${memberId}/`);
}

export async function fetchOrgMessages(orgId: string, withUserId?: string): Promise<Paginated<OrganizationMessage>> {
  const { data } = await apiClient.get<Paginated<OrganizationMessage>>(`/organizations/${orgId}/messages/`, {
    params: withUserId ? { with: withUserId } : undefined,
  });
  return data;
}

export async function sendOrgMessage(
  orgId: string,
  message: string,
  recipientId?: string,
): Promise<OrganizationMessage> {
  const { data } = await apiClient.post<OrganizationMessage>(`/organizations/${orgId}/messages/`, {
    message,
    recipient: recipientId ?? null,
  });
  return data;
}

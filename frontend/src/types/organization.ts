export type OrgType = "personal" | "company";
export type OrgStatus = "active" | "suspended";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  org_type: OrgType;
  website: string;
  country: string;
  industry: string;
  is_profile_complete: boolean;
  status: OrgStatus;
  suspended_reason: string;
  suspended_at: string | null;
  created_by: string | null;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export type OrgRole = "owner" | "admin" | "member";

export interface OrganizationMember {
  id: string;
  organization: string;
  user: string;
  user_email: string;
  user_name: string;
  user_status: "active" | "deactivated" | "deleted";
  is_online: boolean;
  role: OrgRole;
  joined_at: string;
}

export interface OrganizationMessage {
  id: string;
  organization: string;
  sender: string;
  sender_email: string;
  sender_name: string;
  recipient: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  message: string;
  created_at: string;
}

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
  role: OrgRole;
  joined_at: string;
}

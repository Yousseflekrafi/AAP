export type AccountType = "personal" | "company";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  account_type: AccountType;
  is_active: boolean;
  is_email_verified: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  auth_provider: "password" | "google";
  roles: string[];
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  account_type?: AccountType;
}

export interface AuthResponse {
  access: string;
  user: User;
}

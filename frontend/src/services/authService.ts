import { apiClient } from "./apiClient";
import { setAccessToken, clearAccessToken } from "./tokenStore";
import type { AuthResponse, LoginPayload, RegisterPayload, User } from "../types/auth";

export async function register(payload: RegisterPayload): Promise<{ detail: string }> {
  const { data } = await apiClient.post("/auth/register/", payload);
  return data;
}

export async function verifyEmail(email: string, code: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/verify-email/", { email, code });
  setAccessToken(data.access);
  return data;
}

export async function resendVerification(email: string): Promise<{ detail: string }> {
  const { data } = await apiClient.post("/auth/verify-email/resend/", { email });
  return data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login/", payload);
  setAccessToken(data.access);
  return data;
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login/google/", { id_token: idToken });
  setAccessToken(data.access);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout/");
  } finally {
    clearAccessToken();
  }
}

export async function forgotPassword(email: string): Promise<{ detail: string }> {
  const { data } = await apiClient.post("/auth/password/forgot/", { email });
  return data;
}

export async function resetPassword(token: string, password: string): Promise<{ detail: string }> {
  const { data } = await apiClient.post("/auth/password/reset/", { token, password });
  return data;
}

export async function changePassword(current_password: string, new_password: string): Promise<{ detail: string }> {
  const { data } = await apiClient.post("/auth/password/change/", { current_password, new_password });
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me/");
  return data;
}

export async function tryRestoreSession(): Promise<User | null> {
  try {
    const { data } = await apiClient.post<{ access: string }>("/auth/refresh/");
    setAccessToken(data.access);
    return await fetchMe();
  } catch {
    return null;
  }
}

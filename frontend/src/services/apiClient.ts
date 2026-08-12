import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_URL } from "../utils/env";
import { getAccessToken, setAccessToken, clearAccessToken } from "./tokenStore";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send the HttpOnly refresh cookie
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await axios.post<{ access: string }>(
      `${API_URL}/auth/refresh/`,
      {},
      { withCredentials: true },
    );
    setAccessToken(response.data.access);
    return response.data.access;
  } catch {
    clearAccessToken();
    return null;
  }
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    if (error.response?.status === 401 && config && !config._retried) {
      config._retried = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(config);
      }
    }
    return Promise.reject(error);
  },
);

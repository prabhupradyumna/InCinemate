// Axios-based API client with interceptors and refresh retry
import axios from 'axios';

const BASE_URL = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:9000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (!config.headers['Content-Type']) config.headers['Content-Type'] = 'application/json';
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error?.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        await new Promise<void>((resolve) => pendingRequests.push(resolve));
        original._retry = true;
        return api(original);
      }
      isRefreshing = true;
      original._retry = true;
      try {
        const ok = await refreshToken();
        pendingRequests.forEach((r) => r());
        pendingRequests = [];
        return ok ? api(original) : Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export async function http(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, body?: any) {
  const resp = await api.request({ method, url: path, data: body });
  return resp.data;
}

export async function loginAdmin(payload: { email: string; password: string }) {
  const res = await http('POST', '/auth/admin/login', payload);
  const token = res?.data?.accessToken;
  if (token) localStorage.setItem('accessToken', token);
  return res;
}

export async function loginSuperAdmin(payload: { email: string; password: string }) {
  const res = await http('POST', '/auth/super-admin/login', payload);
  const token = res?.data?.accessToken;
  if (token) localStorage.setItem('accessToken', token);
  return res;
}

export async function getMe() {
  return http('GET', '/auth/me');
}

export async function logout() {
  await http('POST', '/auth/logout');
  localStorage.removeItem('accessToken');
}

export async function refreshToken(): Promise<boolean> {
  try {
    const res = await http('POST', '/auth/refresh');
    const token = res?.data?.accessToken;
    if (token) {
      localStorage.setItem('accessToken', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    }
  } catch {}
  return false;
}

export const apiClient = { http, loginAdmin, loginSuperAdmin, getMe, logout };

export default apiClient;



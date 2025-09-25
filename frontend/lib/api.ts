import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api';
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (!((config.headers as any)['Content-Type'])) (config.headers as any)['Content-Type'] = 'application/json';
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) (config.headers as any).Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false as boolean;
let pendingResolvers: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as any;
    if (error?.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        await new Promise<void>((resolve) => pendingResolvers.push(resolve));
        original._retry = true;
        return api(original);
      }
      isRefreshing = true;
      original._retry = true;
      try {
        const ok = await refreshToken();
        pendingResolvers.forEach((r) => r());
        pendingResolvers = [];
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
  const token = (res as any)?.data?.accessToken;
  if (token && typeof window !== 'undefined') localStorage.setItem('accessToken', token);
  return res as any;
}

export async function loginSuperAdmin(payload: { email: string; password: string }) {
  const res = await http('POST', '/auth/super-admin/login', payload);
  const token = (res as any)?.data?.accessToken;
  if (token && typeof window !== 'undefined') localStorage.setItem('accessToken', token);
  return res as any;
}

export async function getMe() {
  return http('GET', '/auth/me');
}

export async function logoutApi() {
  await http('POST', '/auth/logout');
  if (typeof window !== 'undefined') localStorage.removeItem('accessToken');
}

export async function refreshToken(): Promise<boolean> {
  try {
    const res = await http('POST', '/auth/refresh');
    const token = (res as any)?.data?.accessToken;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
      (api.defaults.headers as any).common = (api.defaults.headers as any).common || {};
      (api.defaults.headers as any).common['Authorization'] = `Bearer ${token}`;
      return true;
    }
  } catch {}
  return false;
}

export default api;

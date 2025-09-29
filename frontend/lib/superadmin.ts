import { api } from './api';

export type Role = 'customer' | 'admin' | 'super-admin' | 'super_admin';

export interface AdminUserDTO {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  tenant_id: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface CreateAdminPayload {
  email: string;
  full_name: string;
  phone?: string;
  tenant_id: string;
  password?: string;
}

export interface PermissionDTO {
  id: number;
  name: string;
  description?: string;
  category: string;
  granted?: boolean;
}

export async function listAdmins(): Promise<AdminUserDTO[]> {
  const res = await api.get('/superadmin/admins');
  return res.data?.data || [];
}

export async function createAdmin(payload: CreateAdminPayload) {
  const res = await api.post('/superadmin/admins', payload);
  return res.data?.data;
}

export async function listPermissions(): Promise<PermissionDTO[]> {
  const res = await api.get('/superadmin/permissions');
  return res.data?.data || [];
}

export async function getAdminPermissions(adminId: string): Promise<{ admin: any; permissions: PermissionDTO[]; }> {
  const res = await api.get(`/superadmin/admins/${adminId}/permissions`);
  return res.data?.data;
}

export async function updateAdminPermissions(adminId: string, permissions: number[]) {
  const res = await api.put(`/superadmin/admins/${adminId}/permissions`, { permissions });
  return res.data;
}

export async function listTheatres() {
  const res = await api.get('/superadmin/theatres');
  return res.data?.data || [];
}

export async function createTheatre(payload: { name: string; address: string; city: string; state?: string; country?: string; postal_code?: string; tax_rate_percent?: number; contact_phone?: string; contact_email?: string; }) {
  const res = await api.post('/superadmin/theatres', payload);
  return res.data?.data;
}

export async function listAuditoriumRequests(params?: { status?: 'pending'|'approved'|'rejected' }) {
  const res = await api.get('/superadmin/auditorium-requests', { params });
  return res.data?.data || [];
}

export async function updateAuditoriumRequestStatus(id: string, status: 'approved'|'rejected', rejection_reason?: string) {
  const res = await api.put(`/superadmin/auditorium-requests/${id}/status`, { status, rejection_reason });
  return res.data?.data;
}

export async function getAuditoriumRequest(id: string) {
  const res = await api.get(`/superadmin/auditorium-requests/${id}`);
  return res.data?.data;
}

export async function createAuditoriumConfiguration(payload: {
  request_id: string;
  theatre_id: string;
  name: string;
  seat_map: Array<{
    row: string;
    number: number;
    category: string;
    x_position: number;
    y_position: number;
    is_active: boolean;
  }>;
  total_seats: number;
  configuration: any;
}) {
  const res = await api.post('/superadmin/auditoriums/configure', payload);
  return res.data?.data;
}

// Tenants
export async function listTenants() {
  const res = await api.get('/superadmin/tenants');
  return res.data?.data || [];
}

export async function createTenant(payload: { tenant_id: string; name: string; owner_name?: string; email?: string; phone?: string; address?: string; city?: string; state?: string; country?: string; postal_code?: string; }) {
  const res = await api.post('/superadmin/tenants', payload);
  return res.data?.data;
}



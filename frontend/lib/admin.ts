import { api } from './api';
import type {
  Show,
  CreateShowPayload,
  ShowWithDetails,
  Coupon,
  CreateCouponPayload,
  AuditoriumRequest,
  LiveDashboardData,
  User,
  PaginatedResponse,
  ApiResponse
} from './types';

// ==============================
// AUDITORIUM REQUEST SERVICES
// ==============================

export async function submitAuditoriumRequest(payload: {
  theatre_id: string;
  blueprint_url: string;
  notes?: string;
}): Promise<AuditoriumRequest> {
  const res = await api.post('/admin/auditorium-requests', payload);
  return res.data?.data;
}

export async function getMyAuditoriumRequests(): Promise<AuditoriumRequest[]> {
  const res = await api.get('/admin/auditorium-requests');
  return res.data?.data || [];
}

// ==============================
// BOOKING MANAGEMENT SERVICES
// ==============================

export async function getAllBookings(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<any> {
  const res = await api.get('/admin/bookings', { params });
  return res.data;
}

// Note: Status update functionality removed for simplicity

export async function getAllBookedSeats(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<any> {
  const res = await api.get('/admin/booked-seats', { params });
  return res.data;
}

export async function deleteBookedSeat(seatId: string): Promise<ApiResponse<any>> {
  const res = await api.delete(`/admin/booked-seats/${seatId}`);
  return res.data;
}

// ==============================
// SHOW MANAGEMENT SERVICES
// ==============================

export async function scheduleShow(payload: CreateShowPayload): Promise<Show> {
  const res = await api.post('/admin/shows', payload);
  return res.data?.data;
}

export async function listShows(params?: {
  page?: number;
  limit?: number;
  status?: 'scheduled' | 'live' | 'completed' | 'cancelled';
  movie_id?: string;
}): Promise<PaginatedResponse<ShowWithDetails>> {
  const res = await api.get('/admin/shows', { params });
  return res.data;
}

export async function updateShow(id: string, payload: Partial<CreateShowPayload>): Promise<Show> {
  const res = await api.put(`/admin/shows/${id}`, payload);
  return res.data?.data;
}

export async function cancelShow(id: string, reason?: string): Promise<Show> {
  const res = await api.put(`/admin/shows/${id}/cancel`, { reason });
  return res.data?.data;
}

// ==============================
// COUPON MANAGEMENT SERVICES
// ==============================

export async function createCoupon(payload: CreateCouponPayload): Promise<Coupon> {
  const res = await api.post('/admin/coupons', payload);
  return res.data?.data;
}

export async function listCoupons(params?: {
  page?: number;
  limit?: number;
  status?: 'active' | 'all';
}): Promise<PaginatedResponse<Coupon>> {
  const res = await api.get('/admin/coupons', { params });
  return res.data;
}

export async function updateCoupon(id: string, payload: Partial<CreateCouponPayload>): Promise<Coupon> {
  const res = await api.put(`/admin/coupons/${id}`, payload);
  return res.data?.data;
}

export async function deactivateCoupon(id: string): Promise<Coupon> {
  const res = await api.put(`/admin/coupons/${id}/deactivate`);
  return res.data?.data;
}

export async function getCouponStats(id: string): Promise<{
  total_usage: number;
  total_discount: number;
  recent_bookings: any[];
}> {
  const res = await api.get(`/admin/coupons/${id}/stats`);
  return res.data?.data;
}

// ==============================
// LIVE OPERATIONS SERVICES
// ==============================

export async function getLiveDashboard(showId: string): Promise<LiveDashboardData> {
  const res = await api.get(`/admin/shows/${showId}/live`);
  return res.data?.data;
}

export async function getShowBookings(showId: string, params?: {
  page?: number;
  limit?: number;
  status?: 'pending' | 'paid' | 'cancelled';
}): Promise<PaginatedResponse<any>> {
  const res = await api.get(`/admin/shows/${showId}/bookings`, { params });
  return res.data;
}

export async function getBookingDetails(bookingId: string): Promise<any> {
  const res = await api.get(`/admin/bookings/${bookingId}`);
  return res.data?.data;
}

// ==============================
// STAFF MANAGEMENT SERVICES
// ==============================

export async function createTicketChecker(payload: {
  email: string;
  full_name: string;
  phone?: string;
}): Promise<User & { temp_password: string }> {
  const res = await api.post('/admin/ticket-checkers', payload);
  return res.data?.data;
}

export async function listTicketCheckers(): Promise<User[]> {
  const res = await api.get('/admin/ticket-checkers');
  return res.data?.data || [];
}

export async function updateTicketChecker(id: string, payload: {
  full_name?: string;
  phone?: string;
  is_active?: boolean;
}): Promise<User> {
  const res = await api.put(`/admin/ticket-checkers/${id}`, payload);
  return res.data?.data;
}

export async function deactivateTicketChecker(id: string): Promise<User> {
  const res = await api.put(`/admin/ticket-checkers/${id}/deactivate`);
  return res.data?.data;
}

// ==============================
// ANALYTICS & REPORTS SERVICES
// ==============================

export async function getDashboardStats(): Promise<{
  total_movies: number;
  active_shows: number;
  total_bookings: number;
  total_revenue: number;
  today_bookings: number;
  today_revenue: number;
}> {
  const res = await api.get('/admin/dashboard/stats');
  return res.data?.data;
}

export async function getRevenueReport(params?: {
  start_date?: string;
  end_date?: string;
  movie_id?: string;
}): Promise<{
  total_revenue: number;
  total_bookings: number;
  daily_revenue: Array<{
    date: string;
    revenue: number;
    bookings: number;
  }>;
  movie_breakdown: Array<{
    movie_id: string;
    movie_title: string;
    revenue: number;
    bookings: number;
  }>;
}> {
  const res = await api.get('/admin/reports/revenue', { params });
  return res.data?.data;
}

export async function getBookingReport(params?: {
  start_date?: string;
  end_date?: string;
  status?: 'pending' | 'paid' | 'cancelled';
}): Promise<{
  total_bookings: number;
  booking_status_breakdown: Record<string, number>;
  daily_bookings: Array<{
    date: string;
    bookings: number;
    revenue: number;
  }>;
  top_movies: Array<{
    movie_id: string;
    movie_title: string;
    bookings: number;
    revenue: number;
  }>;
}> {
  const res = await api.get('/admin/reports/bookings', { params });
  return res.data?.data;
}

// ==============================
// BULK OPERATIONS SERVICES
// ==============================

export async function bulkCreateShows(payload: {
  movie_id: string;
  auditorium_id: string;
  pricing: Record<string, number>;
  show_times: Array<{
    date: string;
    times: string[];
  }>;
}): Promise<Show[]> {
  const res = await api.post('/admin/shows/bulk', payload);
  return res.data?.data || [];
}

export async function bulkUpdatePricing(payload: {
  show_ids: string[];
  pricing: Record<string, number>;
}): Promise<Show[]> {
  const res = await api.put('/admin/shows/bulk/pricing', payload);
  return res.data?.data || [];
}

export async function bulkCancelShows(payload: {
  show_ids: string[];
  reason?: string;
}): Promise<Show[]> {
  const res = await api.put('/admin/shows/bulk/cancel', payload);
  return res.data?.data || [];
}

// ==============================
// EXPORT SERVICES
// ==============================

export async function exportBookings(params?: {
  start_date?: string;
  end_date?: string;
  show_id?: string;
  format?: 'csv' | 'excel';
}): Promise<Blob> {
  const res = await api.get('/admin/exports/bookings', {
    params,
    responseType: 'blob'
  });
  return res.data;
}

export async function exportRevenueReport(params?: {
  start_date?: string;
  end_date?: string;
  format?: 'csv' | 'excel';
}): Promise<Blob> {
  const res = await api.get('/admin/exports/revenue', {
    params,
    responseType: 'blob'
  });
  return res.data;
}

// ==============================
// UTILITY SERVICES
// ==============================

export async function getAvailableAuditoriums(): Promise<any[]> {
  const res = await api.get('/admin/auditoriums/available');
  return res.data?.data || [];
}

export async function getShowTimeConflicts(payload: {
  auditorium_id: string;
  show_datetime: string;
  duration_minutes?: number;
}): Promise<{
  has_conflict: boolean;
  conflicting_shows: Show[];
}> {
  const res = await api.post('/admin/shows/check-conflicts', payload);
  return res.data?.data;
}

export async function validateCouponCode(code: string): Promise<{
  is_valid: boolean;
  coupon?: Coupon;
  error?: string;
}> {
  const res = await api.get(`/admin/coupons/validate/${code}`);
  return res.data?.data;
}

import { api } from "./api";
import type {
  HoldSeatsPayload,
  SeatHoldResult,
} from "./types";

// ==============================
// BOOKING MANAGEMENT SERVICES
// ==============================

// export async function getMyBookings(params?: {
//   page?: number;
//   limit?: number;
//   status?: "pending" | "paid" | "cancelled" | "refunded";
// }): Promise<PaginatedResponse<BookingWithDetails>> {
//   const res = await api.get("/customer/bookings", { params });
//   return res.data;
// }

// export async function getBookingDetails(
//   id: string
// ): Promise<BookingWithDetails> {
//   const res = await api.get(`/customer/bookings/${id}`);
//   return res.data?.data;
// }

// export async function cancelBooking(
//   id: string,
//   reason?: string
// ): Promise<Booking> {
//   const res = await api.post(`/customer/bookings/${id}/cancel`, { reason });
//   return res.data?.data;
// }

// ==============================
// SEAT HOLDING & BOOKING SERVICES
// ==============================

export async function holdSeats(
  payload: HoldSeatsPayload
): Promise<SeatHoldResult> {
  const res = await api.post("/customer/bookings/hold-seats", payload);
  return res.data?.data;
}

// export async function confirmBooking(payload: ConfirmBookingPayload): Promise<{
//   booking_id: string;
//   booking_reference: string;
//   status: string;
//   payment_id: string;
//   ticket_qr_code: string;
//   total_price: number;
// }> {
//   const res = await api.post("/customer/bookings/confirm", payload);
//   return res.data?.data;
// }

export async function releaseSeatHold(holdId: string): Promise<boolean> {
  const res = await api.delete(`/customer/bookings/hold-seats/${holdId}`);
  return res.data?.success || false;
}

// ==============================
// COUPON SERVICES
// ==============================

// export async function validateCoupon(
//   payload: ValidateCouponPayload
// ): Promise<CouponValidationResult> {
//   const res = await api.post("/customer/coupons/validate", payload);
//   return res.data?.data;
// }

// export async function applyCoupon(
//   bookingId: string,
//   couponId: string
// ): Promise<{
//   booking_id: string;
//   discount_amount: number;
//   total_price: number;
// }> {
//   const res = await api.post("/customer/coupons/apply", {
//     booking_id: bookingId,
//     coupon_id: couponId,
//   });
//   return res.data?.data;
// }

// export async function removeCoupon(bookingId: string): Promise<{
//   booking_id: string;
//   discount_amount: number;
//   total_price: number;
// }> {
//   const res = await api.delete(`/customer/coupons/apply/${bookingId}`);
//   return res.data?.data;
// }

// // ==============================
// // PAYMENT SERVICES
// // ==============================

// export async function getPaymentMethods(): Promise<PaymentMethod[]> {
//   const res = await api.get("/customer/payment-methods");
//   return res.data?.data || [];
// }

// // ==============================
// // PROFILE
// // ==============================

// export async function getCustomerProfile(): Promise<{
//   userId: string;
//   email: string | null;
//   phone: string | null;
//   full_name: string | null;
// }> {
//   const res = await api.get("/customer/profile");
//   return res.data?.data;
// }

// export async function updateCustomerProfile(payload: {
//   email?: string;
//   phone?: string;
//   full_name?: string;
// }): Promise<{
//   userId: string;
//   email: string | null;
//   phone: string | null;
//   full_name: string | null;
// }> {
//   const res = await api.put("/customer/profile", payload);
//   return res.data?.data;
// }

// export async function processPayment(payload: {
//   booking_id: string;
//   payment_method: string;
//   payment_details: Record<string, any>;
// }): Promise<{
//   success: boolean;
//   payment_id?: string;
//   status: string;
//   message: string;
//   gateway_response?: any;
// }> {
//   const res = await api.post("/customer/payments/process", payload);
//   return res.data?.data;
// }

// export async function verifyPayment(paymentId: string): Promise<{
//   success: boolean;
//   status: string;
//   amount: number;
//   message: string;
// }> {
//   const res = await api.get(`/customer/payments/verify/${paymentId}`);
//   return res.data?.data;
// }

// export async function initiateRefund(
//   bookingId: string,
//   reason?: string
// ): Promise<{
//   success: boolean;
//   refund_id?: string;
//   status: string;
//   message: string;
//   amount?: number;
// }> {
//   const res = await api.post(`/customer/bookings/${bookingId}/refund`, {
//     reason,
//   });
//   return res.data?.data;
// }

// // ==============================
// // TICKET SERVICES
// // ==============================

// export async function getTicketQRCode(bookingId: string): Promise<{
//   qr_code: string;
//   booking_reference: string;
//   show_details: any;
// }> {
//   const res = await api.get(`/customer/bookings/${bookingId}/ticket`);
//   return res.data?.data;
// }

// export async function downloadTicket(
//   bookingId: string,
//   format: "pdf" | "image" = "pdf"
// ): Promise<Blob> {
//   const res = await api.get(`/customer/bookings/${bookingId}/download`, {
//     params: { format },
//     responseType: "blob",
//   });
//   return res.data;
// }

// export async function sendTicketEmail(bookingId: string): Promise<{
//   success: boolean;
//   message: string;
// }> {
//   const res = await api.post(`/customer/bookings/${bookingId}/send-email`);
//   return res.data?.data;
// }

// ==============================
// PROFILE SERVICES
// ==============================

// export async function updateProfile(payload: {
//   full_name?: string;
//   phone?: string;
// }): Promise<User> {
//   const res = await api.put("/customer/profile", payload);
//   return res.data?.data;
// }

// export async function changePassword(payload: {
//   current_password: string;
//   new_password: string;
// }): Promise<{
//   success: boolean;
//   message: string;
// }> {
//   const res = await api.put("/customer/change-password", payload);
//   return res.data?.data;
// }

// export async function deleteAccount(): Promise<{
//   success: boolean;
//   message: string;
// }> {
//   const res = await api.delete("/customer/account");
//   return res.data?.data;
// }

// // ==============================
// // PREFERENCES SERVICES
// // ==============================

// export async function getPreferences(): Promise<{
//   preferred_city?: string;
//   preferred_language?: string;
//   preferred_genres?: string[];
//   email_notifications: boolean;
//   sms_notifications: boolean;
//   marketing_emails: boolean;
// }> {
//   const res = await api.get("/customer/preferences");
//   return res.data?.data;
// }

// export async function updatePreferences(payload: {
//   preferred_city?: string;
//   preferred_language?: string;
//   preferred_genres?: string[];
//   email_notifications?: boolean;
//   sms_notifications?: boolean;
//   marketing_emails?: boolean;
// }): Promise<any> {
//   const res = await api.put("/customer/preferences", payload);
//   return res.data?.data;
// }

// // ==============================
// // FAVORITES SERVICES
// // ==============================

// export async function getFavoriteMovies(): Promise<any[]> {
//   const res = await api.get("/customer/favorites/movies");
//   return res.data?.data || [];
// }

// export async function addFavoriteMovie(movieId: string): Promise<{
//   success: boolean;
//   message: string;
// }> {
//   const res = await api.post("/customer/favorites/movies", {
//     movie_id: movieId,
//   });
//   return res.data?.data;
// }

// export async function removeFavoriteMovie(movieId: string): Promise<{
//   success: boolean;
//   message: string;
// }> {
//   const res = await api.delete(`/customer/favorites/movies/${movieId}`);
//   return res.data?.data;
// }

// export async function getFavoriteTheatres(): Promise<any[]> {
//   const res = await api.get("/customer/favorites/theatres");
//   return res.data?.data || [];
// }

// export async function addFavoriteTheatre(theatreId: string): Promise<{
//   success: boolean;
//   message: string;
// }> {
//   const res = await api.post("/customer/favorites/theatres", {
//     theatre_id: theatreId,
//   });
//   return res.data?.data;
// }

// export async function removeFavoriteTheatre(theatreId: string): Promise<{
//   success: boolean;
//   message: string;
// }> {
//   const res = await api.delete(`/customer/favorites/theatres/${theatreId}`);
//   return res.data?.data;
// }

// // ==============================
// // REVIEWS & RATINGS SERVICES
// // ==============================

// export async function getMyReviews(): Promise<any[]> {
//   const res = await api.get("/customer/reviews");
//   return res.data?.data || [];
// }

// export async function submitReview(payload: {
//   movie_id: string;
//   rating: number;
//   review_text?: string;
// }): Promise<{
//   success: boolean;
//   message: string;
//   review_id?: string;
// }> {
//   const res = await api.post("/customer/reviews", payload);
//   return res.data?.data;
// }

// export async function updateReview(
//   reviewId: string,
//   payload: {
//     rating?: number;
//     review_text?: string;
//   }
// ): Promise<{
//   success: boolean;
//   message: string;
// }> {
//   const res = await api.put(`/customer/reviews/${reviewId}`, payload);
//   return res.data?.data;
// }

// export async function deleteReview(reviewId: string): Promise<{
//   success: boolean;
//   message: string;
// }> {
//   const res = await api.delete(`/customer/reviews/${reviewId}`);
//   return res.data?.data;
// }

// // ==============================
// // NOTIFICATIONS SERVICES
// // ==============================

// export async function getNotifications(params?: {
//   page?: number;
//   limit?: number;
//   unread_only?: boolean;
// }): Promise<PaginatedResponse<any>> {
//   const res = await api.get("/customer/notifications", { params });
//   return res.data;
// }

// export async function markNotificationAsRead(notificationId: string): Promise<{
//   success: boolean;
//   message: string;
// }> {
//   const res = await api.put(`/customer/notifications/${notificationId}/read`);
//   return res.data?.data;
// }

// export async function markAllNotificationsAsRead(): Promise<{
//   success: boolean;
//   message: string;
// }> {
//   const res = await api.put("/customer/notifications/read-all");
//   return res.data?.data;
// }

// export async function deleteNotification(notificationId: string): Promise<{
//   success: boolean;
//   message: string;
// }> {
//   const res = await api.delete(`/customer/notifications/${notificationId}`);
//   return res.data?.data;
// }

// // ==============================
// // SUPPORT SERVICES
// // ==============================

// export async function submitSupportTicket(payload: {
//   subject: string;
//   message: string;
//   category: "booking" | "payment" | "technical" | "general";
//   booking_id?: string;
// }): Promise<{
//   success: boolean;
//   ticket_id: string;
//   message: string;
// }> {
//   const res = await api.post("/customer/support/tickets", payload);
//   return res.data?.data;
// }

// export async function getSupportTickets(): Promise<any[]> {
//   const res = await api.get("/customer/support/tickets");
//   return res.data?.data || [];
// }

// export async function getSupportTicket(ticketId: string): Promise<any> {
//   const res = await api.get(`/customer/support/tickets/${ticketId}`);
//   return res.data?.data;
// }

// export async function replyToSupportTicket(
//   ticketId: string,
//   message: string
// ): Promise<{
//   success: boolean;
//   message: string;
// }> {
//   const res = await api.post(`/customer/support/tickets/${ticketId}/reply`, {
//     message,
//   });
//   return res.data?.data;
// }

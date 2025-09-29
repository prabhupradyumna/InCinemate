// ==============================
// MAIN EXPORTS
// ==============================

// Core API and utilities
export { api, http } from './api';
export * from './utils';
export * from './types';

// Authentication services
export {
  loginAdmin,
  loginSuperAdmin,
  getMe,
  logoutApi,
  refreshToken
} from './api';

// Superadmin services
export * from './superadmin';

// Admin services
export * from './admin';

// Customer services - explicit exports to avoid naming conflicts
export {
  getMyBookings,
  getBookingDetails as getCustomerBookingDetails,
  cancelBooking,
  holdSeats,
  confirmBooking,
  releaseSeatHold,
  validateCoupon,
  applyCoupon,
  removeCoupon,
  getPaymentMethods,
  processPayment,
  verifyPayment,
  initiateRefund,
  getTicketQRCode,
  downloadTicket,
  sendTicketEmail,
  updateProfile,
  changePassword,
  deleteAccount,
  getPreferences,
  updatePreferences,
  getFavoriteMovies,
  addFavoriteMovie,
  removeFavoriteMovie,
  getFavoriteTheatres,
  addFavoriteTheatre,
  removeFavoriteTheatre,
  getMyReviews,
  submitReview,
  updateReview,
  deleteReview,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  submitSupportTicket,
  getSupportTickets,
  getSupportTicket,
  replyToSupportTicket
} from './customer';

// Public services
export * from './public';

// ==============================
// CONVENIENCE EXPORTS
// ==============================

// Re-export commonly used types
export type {
  User,
  Role,
  Movie,
  Show,
  Booking,
  Coupon,
  Theatre,
  Auditorium,
  Seat,
  PaymentMethod,
  ApiResponse,
  PaginatedResponse
} from './types';

// Re-export commonly used utilities
export {
  cn,
  formatDate,
  formatDateTime,
  formatTime,
  formatCurrency,
  formatPrice,
  isValidEmail,
  isValidPhone,
  getErrorMessage,
  debounce,
  throttle
} from './utils';

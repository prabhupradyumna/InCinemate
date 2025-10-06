// ==============================
// CORE TYPES
// ==============================

export type Role = 'customer' | 'admin' | 'super-admin' | 'super_admin' | 'ticket_checker';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: Role;
  tenant_id?: string;
  is_active: boolean;
  created_at?: string;
}

// ==============================
// MOVIE TYPES
// ==============================

export interface Movie {
  id: string;
  title: string;
  poster_url?: string;
  trailer_url?: string;
  synopsis?: string;
  backdrop_url?: string;
  additional_trailers?: string[];
  photo_gallery?: string[];
  short_description?: string;
  tagline?: string;
  genres?: string[];
  sub_genres?: string[];
  duration_minutes?: number;
  release_date?: string;
  rating?: string; // CBFC rating
  cbfc_certificate?: string;
  content_advisories?: string[];
  languages?: string[];
  subtitle_languages?: string[];
  formats?: string[]; // 2D, 3D, IMAX, etc.
  countries?: string[];
  city?: string;
  imdb_rating?: number;
  rotten_tomatoes?: number;
  metacritic_score?: number;
  production_houses?: string[];
  distributors?: string[];
  budget?: number;
  aspect_ratio?: string;
  sound_mix?: string[];
  camera_used?: string;
  has_songs?: boolean;
  song_count?: number;
  platform_status?: string;
  booking_opens_at?: string;
  booking_closes_at?: string;
  is_re_release?: boolean;
  suggested_base_price_min?: number;
  suggested_base_price_max?: number;
  premium_multiplier?: number;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  social_hashtags?: string[];
  is_featured?: boolean;
  is_trending?: boolean;
  banner_campaign_active?: boolean;
  banner_position?: number;
  campaign_start_date?: string;
  campaign_end_date?: string;
  things_to_know?: string[];
  is_part_of_series?: boolean;
  series_name?: string;
  series_order?: number;
  total_bookings?: number;
  average_user_rating?: number;
  total_ratings?: number;
  // approval_status?: string;
  approved_by?: string;
  approved_at?: string;
  internal_notes?: string;
  is_active: boolean;
  tenant_id: string;
  created_at?: string;
  updated_at?: string;
}

// ==============================
// THEATRE & AUDITORIUM TYPES
// ==============================

export interface Theatre {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_rate_percent: number;
  contact_phone?: string;
  contact_email?: string;
  created_at?: string;
}

export interface Auditorium {
  id: string;
  name: string;
  theatre_id: string;
  theatre?: Theatre;
  created_at?: string;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  category: string;
  auditorium_id: string;
  price?: number;
  is_available?: boolean;
  is_selected?: boolean;
}

export interface AuditoriumRequest {
  id: string;
  theatre_id: string;
  blueprint_url: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  tenant_id: string;
  approved_by?: string;
  rejection_reason?: string;
  created_at?: string;
  theatre?: Theatre;
}

// ==============================
// SHOW TYPES
// ==============================

export interface Show {
  id: string;
  movie_id: string;
  auditorium_id: string;
  show_datetime: string;
  pricing: Record<string, number>; // { "Standard": 250, "VIP": 500 } or { "row_A": 300 }
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  tenant_id: string;
  created_by: string;
  created_at?: string;
  movie?: Movie;
  auditorium?: Auditorium;
}

export interface CreateShowPayload {
  movie_id: string;
  auditorium_id: string;
  show_datetime: string;
  pricing: Record<string, number>;
}

export interface ShowWithDetails extends Show {
  movie: Movie;
  auditorium: Auditorium & {
    theatre: Theatre;
  };
}

// ==============================
// BOOKING TYPES
// ==============================

export interface Booking {
  id: string;
  show_id: string;
  customer_id?: string;
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  subtotal: number;
  discount_amount: number;
  taxes: number;
  total_price: number;
  commission: number;
  coupon_id?: string;
  payment_id?: string;
  payment_method?: string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  ticket_qr_code?: string;
  booking_reference: string;
  tenant_id: string;
  created_at?: string;
  show?: Show;
  coupon?: Coupon;
}

export interface BookedSeat {
  id: string;
  booking_id: string;
  seat_id: string;
  price_paid: number;
  seat_category: string;
  seat?: Seat;
}

export interface BookingWithDetails extends Booking {
  show: ShowWithDetails;
  seats: BookedSeat[];
  coupon?: Coupon;
}

export interface CreateBookingPayload {
  show_id: string;
  seat_ids: string[];
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  coupon_code?: string;
}

export interface HoldSeatsPayload {
  show_id: string;
  seat_ids: string[];
}

export interface ConfirmBookingPayload {
  booking_id: string;
  payment_method: string;
  payment_details: Record<string, any>;
}

// ==============================
// COUPON TYPES
// ==============================

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  expires_at?: string;
  is_active: boolean;
  tenant_id: string;
  created_by: string;
  created_at?: string;
}

export interface CreateCouponPayload {
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  expires_at?: string;
}

export interface ValidateCouponPayload {
  code: string;
  booking_id: string;
}

export interface CouponValidationResult {
  coupon: Coupon;
  discount_amount: number;
  original_total: number;
  new_total: number;
}

// ==============================
// PAYMENT TYPES
// ==============================

export interface PaymentMethod {
  method: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface PaymentDetails {
  card_number?: string;
  expiry_month?: string;
  expiry_year?: string;
  cvv?: string;
  upi_id?: string;
  bank_code?: string;
  wallet_type?: string;
}

// ==============================
// SEAT HOLD TYPES
// ==============================

export interface SeatHoldResult {
  hold_id: string;
  expires_at: string;
  seats: Array<{
    id: string;
    row: string;
    number: number;
    category: string;
    price: number;
  }>;
  subtotal: number;
  total_price: number;
}

// ==============================
// SEARCH & FILTER TYPES
// ==============================

export interface MovieSearchParams {
  city?: string;
  date?: string;
  genre?: string;
  language?: string;
  q?: string;
}

export interface MovieSearchResult {
  movies: Array<Movie & {
    theatres: Array<Theatre & {
      auditoriums: Array<Auditorium & {
        shows: Array<{
          id: string;
          show_datetime: string;
          pricing: Record<string, number>;
        }>;
      }>;
    }>;
  }>;
  search_criteria: MovieSearchParams;
  total_movies: number;
}

export interface SeatMapResult {
  show: ShowWithDetails;
  seat_map: Record<string, Seat[]>; // Grouped by row
  statistics: {
    total_seats: number;
    available_seats: number;
    booked_seats: number;
  };
}

// ==============================
// LIVE OPERATIONS TYPES
// ==============================

export interface LiveDashboardData {
  show: ShowWithDetails;
  seats: Array<Seat & {
    is_booked: boolean;
    booking?: {
      id: string;
      customer_name?: string;
      customer_email: string;
      customer_phone?: string;
      booking_reference: string;
    };
  }>;
  statistics: {
    total_seats: number;
    booked_seats: number;
    available_seats: number;
    total_bookings: number;
    total_revenue: number;
  };
}

// ==============================
// PAGINATION TYPES
// ==============================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

// ==============================
// API RESPONSE TYPES
// ==============================

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
}

// ==============================
// FORM TYPES
// ==============================

export interface LoginForm {
  email: string;
  password: string;
  role: Role;
}

export interface RegisterForm {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

// ==============================
// UTILITY TYPES
// ==============================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface Location {
  city: string;
  state?: string;
  country?: string;
}

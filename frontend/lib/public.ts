import { api } from './api';
import type {
  Movie,
  MovieSearchResult,
  MovieSearchParams,
  SeatMapResult,
  CreateBookingPayload,
  Booking,
  Theatre,
  ShowWithDetails,
  ApiResponse
} from './types';

// ==============================
// MOVIE DISCOVERY SERVICES
// ==============================

export async function searchMoviesByLocation(params: MovieSearchParams): Promise<MovieSearchResult> {
  const res = await api.get('/public/movies', { params });
  return res.data?.data;
}

export async function getMovieDetails(id: string, city?: string): Promise<{
  movie: Movie;
  theatres: Array<Theatre & {
    auditoriums: Array<{
      id: string;
      name: string;
      shows: Array<{
        id: string;
        show_datetime: string;
        pricing: Record<string, number>;
      }>;
    }>;
  }>;
  total_shows: number;
}> {
  const res = await api.get(`/public/movies/${id}`, { 
    params: city ? { city } : {} 
  });
  return res.data?.data;
}

export async function searchMovies(params: MovieSearchParams): Promise<MovieSearchResult> {
  const res = await api.get('/public/search', { params });
  return res.data?.data;
}

export async function getAvailableCities(): Promise<string[]> {
  const res = await api.get('/public/cities');
  return res.data?.data || [];
}

// ==============================
// SEAT MAP SERVICES
// ==============================

export async function getSeatMap(showId: string): Promise<SeatMapResult> {
  const res = await api.get(`/public/shows/${showId}/seats`);
  return res.data?.data;
}

export async function checkSeatAvailability(showId: string, seatIds: string[]): Promise<{
  available_seats: string[];
  unavailable_seats: string[];
  total_available: number;
}> {
  const res = await api.post(`/public/shows/${showId}/check-availability`, {
    seat_ids: seatIds
  });
  return res.data?.data;
}

// ==============================
// GUEST BOOKING SERVICES
// ==============================

export async function createGuestBooking(payload: CreateBookingPayload): Promise<{
  booking_id: string;
  booking_reference: string;
  seats: Array<{
    id: string;
    row: string;
    number: number;
    category: string;
    price: number;
  }>;
  subtotal: number;
  discount_amount: number;
  total_price: number;
  status: string;
}> {
  const res = await api.post('/public/bookings', payload);
  return res.data?.data;
}

export async function getGuestBookingDetails(bookingReference: string): Promise<Booking> {
  const res = await api.get(`/public/bookings/${bookingReference}`);
  return res.data?.data;
}

// ==============================
// SHOWTIME SERVICES
// ==============================

export async function getShowtimes(params: {
  movie_id?: string;
  theatre_id?: string;
  city?: string;
  date?: string;
}): Promise<ShowWithDetails[]> {
  const res = await api.get('/public/showtimes', { params });
  return res.data?.data || [];
}

export async function getUpcomingShows(params?: {
  city?: string;
  limit?: number;
  days_ahead?: number;
}): Promise<ShowWithDetails[]> {
  const res = await api.get('/public/shows/upcoming', { params });
  return res.data?.data || [];
}

export async function getFeaturedMovies(params?: {
  city?: string;
  limit?: number;
}): Promise<Movie[]> {
  const res = await api.get('/public/movies/featured', { params });
  return res.data?.data || [];
}

// ==============================
// THEATRE SERVICES
// ==============================

export async function getTheatresByCity(city: string): Promise<Theatre[]> {
  const res = await api.get('/public/theatres', { params: { city } });
  return res.data?.data || [];
}

export async function getTheatreDetails(theatreId: string): Promise<Theatre & {
  auditoriums: Array<{
    id: string;
    name: string;
    seat_count: number;
    amenities: string[];
  }>;
  upcoming_shows: ShowWithDetails[];
}> {
  const res = await api.get(`/public/theatres/${theatreId}`);
  return res.data?.data;
}

// ==============================
// GENRE & FILTER SERVICES
// ==============================

export async function getAvailableGenres(): Promise<string[]> {
  const res = await api.get('/public/genres');
  return res.data?.data || [];
}

export async function getAvailableLanguages(): Promise<string[]> {
  const res = await api.get('/public/languages');
  return res.data?.data || [];
}

export async function getMovieRatings(): Promise<string[]> {
  const res = await api.get('/public/ratings');
  return res.data?.data || [];
}

// ==============================
// PROMOTIONAL SERVICES
// ==============================

export async function getActiveCoupons(params?: {
  city?: string;
  movie_id?: string;
}): Promise<Array<{
  id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  min_purchase_amount?: number;
  expires_at?: string;
}>> {
  const res = await api.get('/public/coupons', { params });
  return res.data?.data || [];
}

export async function validatePublicCoupon(code: string, amount: number): Promise<{
  is_valid: boolean;
  discount_amount: number;
  coupon?: any;
  error?: string;
}> {
  const res = await api.post('/public/coupons/validate', {
    code,
    amount
  });
  return res.data?.data;
}

// ==============================
// LOCATION SERVICES
// ==============================

export async function getLocationFromIP(): Promise<{
  city: string;
  state?: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}> {
  const res = await api.get('/public/location/ip');
  return res.data?.data;
}

export async function searchCities(query: string): Promise<Array<{
  city: string;
  state?: string;
  country: string;
  full_name: string;
}>> {
  const res = await api.get('/public/cities/search', { 
    params: { q: query } 
  });
  return res.data?.data || [];
}

// ==============================
// CONTENT SERVICES
// ==============================

export async function getMovieTrailer(movieId: string): Promise<{
  trailer_url: string;
  thumbnail_url?: string;
  duration?: number;
}> {
  const res = await api.get(`/public/movies/${movieId}/trailer`);
  return res.data?.data;
}

export async function getMovieCast(movieId: string): Promise<Array<{
  name: string;
  role?: string;
  image_url?: string;
}>> {
  const res = await api.get(`/public/movies/${movieId}/cast`);
  return res.data?.data || [];
}

export async function getMovieReviews(movieId: string, params?: {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating';
}): Promise<{
  reviews: Array<{
    id: string;
    user_name: string;
    rating: number;
    review_text?: string;
    created_at: string;
  }>;
  average_rating: number;
  total_reviews: number;
}> {
  const res = await api.get(`/public/movies/${movieId}/reviews`, { params });
  return res.data?.data;
}

// ==============================
// STATIC CONTENT SERVICES
// ==============================

export async function getAppConfig(): Promise<{
  app_name: string;
  version: string;
  supported_payment_methods: string[];
  supported_languages: string[];
  default_currency: string;
  booking_timeout_minutes: number;
  max_seats_per_booking: number;
  cancellation_policy: string;
  refund_policy: string;
}> {
  const res = await api.get('/public/config');
  return res.data?.data;
}

export async function getTermsAndConditions(): Promise<{
  terms: string;
  privacy_policy: string;
  last_updated: string;
}> {
  const res = await api.get('/public/legal/terms');
  return res.data?.data;
}

export async function getFAQ(): Promise<Array<{
  id: string;
  question: string;
  answer: string;
  category: string;
}>> {
  const res = await api.get('/public/faq');
  return res.data?.data || [];
}

// ==============================
// HEALTH CHECK SERVICES
// ==============================

export async function checkServiceHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'down';
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    payment_gateway: 'up' | 'down';
  };
  response_time_ms: number;
}> {
  const res = await api.get('/public/health');
  return res.data?.data;
}

// ==============================
// ANALYTICS SERVICES (PUBLIC)
// ==============================

export async function getPopularMovies(params?: {
  city?: string;
  limit?: number;
  period?: 'week' | 'month' | 'all';
}): Promise<Array<Movie & {
  booking_count: number;
  revenue: number;
}>> {
  const res = await api.get('/public/analytics/popular-movies', { params });
  return res.data?.data || [];
}

export async function getTrendingGenres(params?: {
  city?: string;
  limit?: number;
}): Promise<Array<{
  genre: string;
  movie_count: number;
  booking_count: number;
}>> {
  const res = await api.get('/public/analytics/trending-genres', { params });
  return res.data?.data || [];
}

import { api } from "./api";

export type Role = "customer" | "admin" | "super-admin" | "super_admin";

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
  const res = await api.get("/superadmin/admins");
  return res.data?.data || [];
}

export async function createAdmin(payload: CreateAdminPayload) {
  const res = await api.post("/superadmin/admins", payload);
  return res.data?.data;
}

export async function listPermissions(): Promise<PermissionDTO[]> {
  const res = await api.get("/superadmin/permissions");
  return res.data?.data || [];
}

export async function getAdminPermissions(
  adminId: string
): Promise<{ admin: any; permissions: PermissionDTO[] }> {
  const res = await api.get(`/superadmin/admins/${adminId}/permissions`);
  return res.data?.data;
}

export async function updateAdminPermissions(
  adminId: string,
  permissions: number[]
) {
  const res = await api.put(`/superadmin/admins/${adminId}/permissions`, {
    permissions,
  });
  return res.data;
}

export async function listTheatres() {
  const res = await api.get("/superadmin/theatres");
  return res.data?.data || [];
}

export async function listAuditoriums() {
  const res = await api.get("/superadmin/auditoriums");
  return res.data?.data || [];
}

export async function getAuditorium(auditoriumId: string) {
  const res = await api.get(`/superadmin/auditoriums/${auditoriumId}`);
  return res.data?.data;
}

export async function getAuditoriumSeats(auditoriumId: string) {
  const res = await api.get(`/superadmin/auditoriums/${auditoriumId}/seats`);
  return res.data?.data || [];
}

export async function updateAuditoriumConfiguration(
  auditoriumId: string,
  payload: {
    name?: string;
    seat_map: Array<{
      row: string;
      number: number;
      category: string;
      x_position?: number;
      y_position?: number;
      is_active?: boolean;
    }>;
    configuration?: any;
  }
) {
  const res = await api.put(`/superadmin/auditoriums/${auditoriumId}`, payload);
  return res.data;
}

export async function createTheatre(payload: {
  name: string;
  address: string;
  city: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_rate_percent?: number;
  contact_phone?: string;
  contact_email?: string;
  owner_name?: string;
}) {
  const res = await api.post("/superadmin/theatres", payload);
  return res.data?.data;
}

export async function listAuditoriumRequests(params?: {
  status?: "pending" | "approved" | "rejected";
}) {
  const res = await api.get("/superadmin/auditorium-requests", { params });
  return res.data?.data || [];
}

export async function updateAuditoriumRequestStatus(
  id: string,
  status: "approved" | "rejected",
  rejection_reason?: string
) {
  const res = await api.put(`/superadmin/auditorium-requests/${id}/status`, {
    status,
    rejection_reason,
  });
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
  const res = await api.post("/superadmin/auditoriums/configure", payload);
  return res.data?.data;
}

// Tenants
export async function listTenants() {
  const res = await api.get("/superadmin/tenants");
  return res.data?.data || [];
}

export async function createTenant(payload: {
  tenant_id: string;
  name: string;
  owner_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}) {
  const res = await api.post("/superadmin/tenants", payload);
  return res.data?.data;
}

// Enhanced Movie Interfaces
export interface MovieDTO {
  id: string;
  title: string;
  
  // Media Assets
  poster_url?: string;
  backdrop_url?: string;
  trailer_url?: string;
  additional_trailers?: string[];
  photo_gallery?: string[];
  
  // Content Details
  synopsis?: string;
  short_description?: string;
  tagline?: string;
  genres?: string[];
  sub_genres?: string[];
  
  // Basic Info
  duration_minutes?: number;
  release_date?: string;
  rating?: string;
  cbfc_certificate?: string;
  content_advisories?: string[];
  
  // Languages & Formats
  languages: string[];
  subtitle_languages?: string[];
  formats: string[];
  countries?: string[];
  
  // External Ratings
  imdb_rating?: number;
  rotten_tomatoes?: number;
  metacritic_score?: number;
  
  // Production
  production_houses?: string[];
  distributors?: string[];
  budget?: number;
  
  // Technical
  aspect_ratio?: string;
  sound_mix?: string[];
  camera_used?: string;
  
  // Music
  has_songs?: boolean;
  song_count?: number;
  
  // Booking & Status
  platform_status: 'coming_soon' | 'advance_booking' | 'now_showing' | 'running_successfully' | 'closing_soon' | 'ended';
  booking_opens_at?: string;
  booking_closes_at?: string;
  is_re_release?: boolean;
  
  // Pricing
  suggested_base_price_min?: number;
  suggested_base_price_max?: number;
  premium_multiplier?: number;
  
  // SEO & Marketing
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  social_hashtags?: string[];
  
  // Features
  is_featured?: boolean;
  is_trending?: boolean;
  banner_campaign_active?: boolean;
  banner_position?: number;
  campaign_start_date?: string;
  campaign_end_date?: string;
  
  // Additional Info
  things_to_know?: string[];
  is_part_of_series?: boolean;
  series_name?: string;
  series_order?: number;
  
  // Analytics
  total_bookings?: number;
  average_user_rating?: number;
  total_ratings?: number;
  total_reviews?: number;
  
  // Administrative
  approval_status: 'draft' | 'pending_review' | 'approved' | 'published' | 'archived';
  approved_by?: string;
  approved_at?: string;
  internal_notes?: string;
  
  // Core
  tenant_id: string;
  is_active: boolean;
  status?: boolean; // Alias for is_active
  createdAt: string;
  updatedAt: string;
  
  // Convenience properties
  duration?: number; // Alias for duration_minutes
  certificate_rating?: string; // Alias for cbfc_certificate
  
  // Related entities (when included)
  cast?: MovieCastDTO[];
  crew?: MovieCrewDTO[];
  reviews?: MovieReviewDTO[];
  songs?: MovieSongDTO[];
}

export interface CreateMoviePayload {
  // Required
  title: string;
  tenant_id: string;
  
  // Media Assets
  poster_url?: string;
  backdrop_url?: string;
  trailer_url?: string;
  additional_trailers?: string[];
  photo_gallery?: string[];
  
  // Content Details
  synopsis?: string;
  short_description?: string;
  tagline?: string;
  genres?: string[];
  sub_genres?: string[];
  
  // Basic Info
  duration_minutes?: number;
  release_date?: string;
  rating?: string;
  cbfc_certificate?: string;
  content_advisories?: string[];
  
  // Languages & Formats
  languages?: string[];
  subtitle_languages?: string[];
  formats?: string[];
  
  // External Ratings
  imdb_rating?: number;
  rotten_tomatoes?: number;
  metacritic_score?: number;
  
  // Production
  production_houses?: string[];
  distributors?: string[];
  budget?: number;
  
  // Technical
  aspect_ratio?: string;
  sound_mix?: string[];
  camera_used?: string;
  
  // Music
  has_songs?: boolean;
  song_count?: number;
  
  // Booking & Status
  platform_status?: 'coming_soon' | 'advance_booking' | 'now_showing' | 'running_successfully' | 'closing_soon' | 'ended';
  booking_opens_at?: string;
  booking_closes_at?: string;
  is_re_release?: boolean;
  
  // Pricing
  suggested_base_price_min?: number;
  suggested_base_price_max?: number;
  premium_multiplier?: number;
  
  // SEO & Marketing
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  social_hashtags?: string[];
  
  // Features
  is_featured?: boolean;
  is_trending?: boolean;
  banner_campaign_active?: boolean;
  banner_position?: number;
  campaign_start_date?: string;
  campaign_end_date?: string;
  
  // Additional Info
  things_to_know?: string[];
  is_part_of_series?: boolean;
  series_name?: string;
  series_order?: number;
  
  // Administrative
  approval_status?: 'draft' | 'pending_review' | 'approved' | 'published' | 'archived';
  internal_notes?: string;
  is_active?: boolean;
}

// Related Entities
export interface ActorDTO {
  id: string;
  name: string;
  profile_image_url?: string;
  date_of_birth?: string;
  bio?: string;
  nationality?: string;
  height?: string;
  awards?: string[];
  social_media?: Record<string, string>;
  total_movies: number;
  avg_movie_rating?: number;
  is_verified: boolean;
  created_by?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrewPersonDTO {
  id: string;
  name: string;
  profile_image_url?: string;
  bio?: string;
  specialty?: string;
  date_of_birth?: string;
  nationality?: string;
  awards?: string[];
  notable_works?: string[];
  social_media?: Record<string, string>;
  total_credits: number;
  avg_movie_rating?: number;
  is_verified: boolean;
  created_by?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MovieCastDTO {
  id: string;
  movie_id: string;
  actor_id: string;
  character_name: string;
  character_description?: string;
  role_type: 'lead' | 'supporting' | 'special_appearance' | 'cameo' | 'voice' | 'narrator';
  display_order: number;
  is_featured: boolean;
  screen_time_minutes?: number;
  character_image_url?: string;
  character_type?: 'protagonist' | 'antagonist' | 'supporting' | 'comic_relief' | 'love_interest' | 'mentor' | 'other';
  created_by?: string;
  actor?: ActorDTO;
  createdAt: string;
  updatedAt: string;
}

export interface MovieCrewDTO {
  id: string;
  movie_id: string;
  person_id: string;
  role_category: 'direction' | 'writing' | 'production' | 'music' | 'technical' | 'art' | 'other';
  role_title: string;
  custom_credit_text?: string;
  is_primary: boolean;
  display_order: number;
  contribution_description?: string;
  department?: string;
  created_by?: string;
  person?: CrewPersonDTO;
  createdAt: string;
  updatedAt: string;
}

export interface MovieReviewDTO {
  id: string;
  movie_id: string;
  review_type: 'critic' | 'editorial' | 'user_featured';
  reviewer_name: string;
  reviewer_title?: string;
  publication?: string;
  publication_logo_url?: string;
  reviewer_image_url?: string;
  rating?: number;
  rating_scale: string;
  review_title?: string;
  review_quote: string;
  full_review_text?: string;
  review_url?: string;
  review_date: string;
  language: string;
  is_featured: boolean;
  is_verified: boolean;
  display_order: number;
  sentiment?: 'positive' | 'mixed' | 'negative';
  likes_count: number;
  helpful_count: number;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MovieSongDTO {
  id: string;
  movie_id: string;
  title: string;
  duration_seconds?: number;
  display_order: number;
  singers: string[];
  lyricist?: string;
  composer?: string;
  audio_url?: string;
  video_url?: string;
  lyrics_url?: string;
  language: string;
  song_type?: 'title_track' | 'romantic' | 'dance' | 'sad' | 'devotional' | 'item_number' | 'background' | 'other';
  is_featured: boolean;
  play_count: number;
  likes_count: number;
  created_by?: string;
  createdAt: string;
  updatedAt: string;
}

// API Payloads for related entities
export interface CreateActorPayload {
  name: string;
  profile_image_url?: string;
  date_of_birth?: string;
  bio?: string;
  nationality?: string;
  height?: string;
  awards?: string[];
  social_media?: Record<string, string>;
}

export interface CreateCrewPersonPayload {
  name: string;
  profile_image_url?: string;
  bio?: string;
  specialty?: string;
  date_of_birth?: string;
  nationality?: string;
  awards?: string[];
  notable_works?: string[];
  social_media?: Record<string, string>;
}

export interface AddMovieCastPayload {
  actor_id: string;
  character_name: string;
  character_description?: string;
  role_type: 'lead' | 'supporting' | 'special_appearance' | 'cameo' | 'voice' | 'narrator';
  display_order?: number;
  is_featured?: boolean;
  screen_time_minutes?: number;
  character_image_url?: string;
  character_type?: 'protagonist' | 'antagonist' | 'supporting' | 'comic_relief' | 'love_interest' | 'mentor' | 'other';
}

export interface AddMovieCrewPayload {
  person_id: string;
  role_category: 'direction' | 'writing' | 'production' | 'music' | 'technical' | 'art' | 'other';
  role_title: string;
  custom_credit_text?: string;
  is_primary?: boolean;
  display_order?: number;
  contribution_description?: string;
  department?: string;
}

export interface AddMovieReviewPayload {
  review_type: 'critic' | 'editorial' | 'user_featured';
  reviewer_name: string;
  reviewer_title?: string;
  publication?: string;
  publication_logo_url?: string;
  reviewer_image_url?: string;
  rating?: number;
  rating_scale?: string;
  review_title?: string;
  review_quote: string;
  full_review_text?: string;
  review_url?: string;
  review_date?: string;
  language?: string;
  is_featured?: boolean;
  sentiment?: 'positive' | 'mixed' | 'negative';
}

// Enhanced Movie API Functions
export async function listMovies(params?: { 
  page?: number; 
  limit?: number; 
  status?: 'active' | 'inactive';
  search?: string;
  genre?: string;
  language?: string;
  platform_status?: string;
  tenant_id?: string;
  sort_by?: 'title' | 'release_date' | 'total_bookings' | 'average_user_rating' | 'created_at';
  sort_order?: 'ASC' | 'DESC';
  include_relations?: boolean;
}): Promise<{ 
  data: MovieDTO[]; 
  pagination: { total: number; page: number; limit: number; totalPages: number };
  filters?: any;
}> {
  const res = await api.get('/superadmin/movies', { params });
  return res.data;
}

export async function getMovie(id: string, include_relations = true): Promise<MovieDTO> {
  const res = await api.get(`/superadmin/movies/${id}`, { 
    params: { include_relations } 
  });
  const movie: MovieDTO = res.data?.data;
  // Normalize backend relation keys to legacy keys used throughout the frontend
  if (movie) {
    if ((movie as any).castMembers && !(movie as any).cast) {
      (movie as any).cast = (movie as any).castMembers;
    }
    if ((movie as any).crewMembers && !(movie as any).crew) {
      (movie as any).crew = (movie as any).crewMembers;
    }
  }
  return movie;
}

export async function createMovie(payload: CreateMoviePayload): Promise<MovieDTO> {
  const res = await api.post('/superadmin/movies', payload);
  return res.data?.data;
}

export async function updateMovie(id: string, payload: Partial<CreateMoviePayload>): Promise<MovieDTO> {
  const res = await api.put(`/superadmin/movies/${id}`, payload);
  return res.data?.data;
}

export async function deleteMovie(id: string): Promise<void> {
  await api.delete(`/superadmin/movies/${id}`);
}

export async function bulkUpdateMovieStatus(payload: {
  movieIds: string[];
  status?: boolean;
  platform_status?: string;
}): Promise<{ updatedCount: number }> {
  const res = await api.patch('/superadmin/movies/bulk-update', payload);
  return res.data?.data;
}

// Movie Cast API Functions
export async function addMovieCast(movieId: string, payload: AddMovieCastPayload): Promise<MovieCastDTO> {
  const res = await api.post(`/superadmin/movies/${movieId}/cast`, payload);
  return res.data?.data;
}

export async function removeMovieCast(movieId: string, castId: string): Promise<void> {
  await api.delete(`/superadmin/movies/${movieId}/cast/${castId}`);
}

export async function updateMovieCast(movieId: string, castId: string, payload: Partial<AddMovieCastPayload>): Promise<MovieCastDTO> {
  const res = await api.put(`/superadmin/movies/${movieId}/cast/${castId}`, payload);
  return res.data?.data;
}

// Movie Crew API Functions
export async function addMovieCrew(movieId: string, payload: AddMovieCrewPayload): Promise<MovieCrewDTO> {
  const res = await api.post(`/superadmin/movies/${movieId}/crew`, payload);
  return res.data?.data;
}

export async function removeMovieCrew(movieId: string, crewId: string): Promise<void> {
  await api.delete(`/superadmin/movies/${movieId}/crew/${crewId}`);
}

export async function updateMovieCrew(movieId: string, crewId: string, payload: Partial<AddMovieCrewPayload>): Promise<MovieCrewDTO> {
  const res = await api.put(`/superadmin/movies/${movieId}/crew/${crewId}`, payload);
  return res.data?.data;
}

// Movie Reviews API Functions
export async function addMovieReview(movieId: string, payload: AddMovieReviewPayload): Promise<MovieReviewDTO> {
  const res = await api.post(`/superadmin/movies/${movieId}/reviews`, payload);
  return res.data?.data;
}

// Actor Management API Functions
export async function listActors(params?: { 
  page?: number; 
  limit?: number; 
  search?: string; 
  nationality?: string;
  verified?: boolean;
}): Promise<{ 
  data: ActorDTO[]; 
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> {
  const res = await api.get('/superadmin/actors', { params });
  return res.data;
}

export async function createActor(payload: CreateActorPayload): Promise<ActorDTO> {
  const res = await api.post('/superadmin/actors', payload);
  return res.data?.data;
}

// Crew Management API Functions
export async function listCrewPersons(params?: { 
  page?: number; 
  limit?: number; 
  search?: string; 
  specialty?: string;
  verified?: boolean;
}): Promise<{ 
  data: CrewPersonDTO[]; 
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> {
  const res = await api.get('/superadmin/crew', { params });
  return res.data;
}

export async function createCrewPerson(payload: CreateCrewPersonPayload): Promise<CrewPersonDTO> {
  const res = await api.post('/superadmin/crew-persons', payload);
  return res.data?.data;
}

export async function updateCrewPerson(id: string, payload: Partial<CreateCrewPersonPayload>): Promise<CrewPersonDTO> {
  const res = await api.put(`/superadmin/crew-persons/${id}`, payload);
  return res.data?.data;
}



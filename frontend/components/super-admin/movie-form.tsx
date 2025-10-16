
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Plus, X, Upload, Users, UserCheck, Camera, Mic, Edit, Trash2, Search, Settings, Clock, Video, Info, FileText, Film, Megaphone, Factory } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { MovieDTO, CreateMoviePayload, listTenants, createMovie, updateMovie, getMovie, addMovieCast, addMovieCrew, updateMovieCast, updateMovieCrew, createActor, createCrewPerson, updateCrewPerson, AddMovieCastPayload, AddMovieCrewPayload, removeMovieCast, removeMovieCrew, listActors, listCrewPersons } from "@/lib/superadmin";
import { useAuth } from "@/components/customer/auth-provider";

// Helper to allow empty strings for numeric inputs (treated as undefined)
const numberOptional = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return undefined;
  if (typeof val === 'string') {
    const n = Number(val);
    return Number.isNaN(n) ? undefined : n;
  }
  return val;
}, z.number().optional());

const movieFormSchema = z.object({
  // Basic Information
  title: z.string().min(1, "Title is required"),
  tenant_id: z.string().min(1, "Tenant is required"),
  synopsis: z.string().optional(),
  short_description: z.string().optional(),
  tagline: z.string().optional(),
  // Location
  city: z.string().min(1, 'City is required'),
  
  // Media Assets
  poster_url: z.string().optional(),
  backdrop_url: z.string().optional(),
  poster_file: z.instanceof(File).optional(),
  backdrop_file: z.instanceof(File).optional(),
  trailer_url: z.string().url().optional().or(z.literal("")),
  
  // Content Details
  genres: z.array(z.string()).optional(),
  duration_minutes: numberOptional,
  release_date: z.string().optional(),
  rating: z.string().optional(),
  cbfc_certificate: z.string().optional(),
  
  // Languages & Formats
  languages: z.array(z.string()).optional(),
  formats: z.array(z.string()).optional(),
  countries: z.array(z.string()).optional(),
  
  // Platform Status
  platform_status: z.enum(["coming_soon", "advance_booking", "now_showing", "running_successfully", "closing_soon", "ended"]).optional(),
  
  // Pricing
  suggested_base_price_min: numberOptional,
  suggested_base_price_max: numberOptional,
  
  // Production
  production_houses: z.array(z.string()).optional(),
  distributors: z.array(z.string()).optional(),
  budget: numberOptional,
  
  // Marketing
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  
  // Status
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_trending: z.boolean().default(false),
  
  // News & Reviews
  news_reviews: z.array(z.object({
    title: z.string().optional(),
    youtube_url: z.string().url().optional().or(z.literal("")),
    source: z.string().optional(),
    published_date: z.string().optional(),
  })).optional(),
  
  // Movie Songs
  movie_songs: z.array(z.object({
    name: z.string().optional(),
    youtube_url: z.string().url().optional().or(z.literal("")),
    duration: z.string().optional(),
  })).optional(),
  
  // Gallery Images
  gallery_images: z.array(z.object({
    name: z.string().optional(),
    image_url: z.string().optional(),
    type: z.enum(["poster", "still", "behind_scenes"]).optional(),
    display_order: z.number().optional(),
    image_file: z.instanceof(File).optional(),
  })).optional(),
});

type MovieFormValues = z.infer<typeof movieFormSchema>;

interface MovieFormProps {
  movie?: MovieDTO | null;
  editId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const GENRES = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
  "Documentary", "Drama", "Family", "Fantasy", "Horror", "Musical",
  "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western"
];

const LANGUAGES = [
  "English", "Hindi", "Tamil", "Telugu", "Malayalam", "Kannada",
  "Bengali", "Gujarati", "Marathi", "Punjabi", "Urdu"
];

const FORMATS = ["2D", "3D", "IMAX", "4DX", "Dolby Atmos", "70mm"];

const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia",
  "France", "Germany", "Italy", "Spain", "Japan", "South Korea",
  "China", "Hong Kong", "Singapore", "Malaysia", "Thailand",
  "Russia", "Brazil", "Mexico", "Argentina", "Netherlands"
];

const CERTIFICATES = ["U", "U/A", "A", "S"];

export function MovieForm({ movie: initialMovie, editId, onSuccess, onCancel }: MovieFormProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingMovie, setFetchingMovie] = useState(false);
  const [movie, setMovie] = useState<MovieDTO | null>(initialMovie || null);
  const [activeTab, setActiveTab] = useState("basic");
  const [tenants, setTenants] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Helper to normalize image URLs for previews (handles relative paths and data URLs)
  const normalizeImageUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("data:")) return url; // already a data URL preview
    if (url.startsWith("http")) return url; // absolute URL
    
    // For local development, use relative URLs since Next.js rewrite handles /uploads
    // For production, use environment variable if provided
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
    const isLocalDev = process.env.NODE_ENV === 'development';
    
    console.log('🖼️ normalizeImageUrl debug:', {
      originalUrl: url,
      baseUrl: baseUrl,
      nodeEnv: process.env.NODE_ENV,
      isLocalDev: isLocalDev
    });
    
    if (isLocalDev) {
      // In local development, use relative URLs (Next.js rewrite will proxy to backend)
      const finalUrl = url.startsWith('/') ? url : `/${url}`;
      console.log('🖼️ Local dev relative URL:', finalUrl);
      return finalUrl;
    } else if (baseUrl && baseUrl.trim()) {
      // In production, use environment variable if provided
      const cleanBaseUrl = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
      const finalUrl = `${cleanBaseUrl}${url.startsWith('/') ? url : `/${url}`}`;
      console.log('🖼️ Production URL:', finalUrl);
      return finalUrl;
    } else {
      // Fallback to relative URLs
      const finalUrl = url.startsWith('/') ? url : `/${url}`;
      console.log('🖼️ Fallback relative URL:', finalUrl);
      return finalUrl;
    }
  };

  // Cast & Crew Management State
  const [castMembers, setCastMembers] = useState<Array<{
    id?: string;
    actor_id?: string;
    actor_name?: string;
    character_name: string;
    role_type: 'lead' | 'supporting' | 'special_appearance' | 'cameo';
    display_order: number;
    bio?: string;
    profile_image?: File | null;
    profile_image_url?: string;
  }>>([]);
  
  const [crewMembers, setCrewMembers] = useState<Array<{
    id?: string;
    person_id?: string;
    person_name?: string;
    role_title: string;
    role_category: 'direction' | 'writing' | 'production' | 'music' | 'technical' | 'art';
    display_order: number;
    bio?: string;
    specialty?: string;
    profile_image?: File | null;
    profile_image_url?: string;
  }>>([]);

  const [showAddCast, setShowAddCast] = useState(false);
  const [showAddCrew, setShowAddCrew] = useState(false);
  const [editingCast, setEditingCast] = useState<any>(null);
  const [editingCrew, setEditingCrew] = useState<any>(null);
  const [removedCastIds, setRemovedCastIds] = useState<string[]>([]);
  const [removedCrewIds, setRemovedCrewIds] = useState<string[]>([]);

  // News & Reviews state
  const [newsReviews, setNewsReviews] = useState<Array<{
    title: string;
    youtube_url: string;
    source: string;
    published_date: string;
  }>>([]);

  // Movie Songs state
  const [movieSongs, setMovieSongs] = useState<Array<{
    name: string;
    youtube_url: string;
    duration: string;
  }>>([]);

  // Gallery Images state
  const [galleryImages, setGalleryImages] = useState<Array<{
    name: string;
    image_url: string;
    type: "poster" | "still" | "behind_scenes";
    display_order: number;
    image_file?: File | null;
  }>>([]);

  // Duration state (hours and minutes)
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);

  // File upload state
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [backdropFile, setBackdropFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string>("");
  const [backdropPreview, setBackdropPreview] = useState<string>("");

  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieFormSchema),
    defaultValues: {
      title: "",
      tenant_id: "",
      city: "",
      synopsis: "",
      short_description: "",
      tagline: "",
      poster_url: "",
      backdrop_url: "",
      poster_file: undefined,
      backdrop_file: undefined,
      trailer_url: "",
      genres: [],
      duration_minutes: 0,
      release_date: "",
      rating: "",
      cbfc_certificate: "",
      languages: [],
      formats: [],
      countries: [],
      platform_status: "coming_soon",
      suggested_base_price_min: 0,
      suggested_base_price_max: 0,
      production_houses: [],
      distributors: [],
      budget: 0,
      meta_title: "",
      meta_description: "",
      keywords: [],
      is_active: true,
      is_featured: false,
      is_trending: false,
      news_reviews: [],
      movie_songs: [],
      gallery_images: [],
    },
  });

  // Helper to coerce values that may arrive as DECIMAL strings from the API into numbers
  const toNumber = (value: any, fallback = 0): number => {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'number') return value;
    const n = parseFloat(String(value));
    return Number.isNaN(n) ? fallback : n;
  };

  // Fetch movie data when editId is provided
  useEffect(() => {
    const fetchMovieData = async () => {
      if (!editId) return;
      
      try {
        setFetchingMovie(true);
        console.log('🎬 Fetching movie data for editId:', editId);
        const movieData = await getMovie(editId, true);
        console.log('✅ Movie data fetched:', movieData);
        setMovie(movieData);
        
        // Populate cast and crew data
        if (movieData.cast) {
          setCastMembers(movieData.cast.map(castMember => {
            // Ensure role_type is one of the allowed values
            const allowedRoleTypes = ['lead', 'supporting', 'special_appearance', 'cameo'] as const;
            const roleType = allowedRoleTypes.includes(castMember.role_type as any) 
              ? castMember.role_type as 'lead' | 'supporting' | 'special_appearance' | 'cameo'
              : 'supporting';
              
            return {
              id: castMember.id,
              actor_id: castMember.actor?.id,
              actor_name: castMember.actor?.name || '',
              character_name: castMember.character_name || '',
              role_type: roleType,
              display_order: castMember.display_order || 0,
              bio: castMember.actor?.bio || '',
              profile_image_url: castMember.actor?.profile_image_url || ''
            };
          }));
        }
        
        if (movieData.crew) {
          setCrewMembers(movieData.crew.map(crewMember => {
            // Ensure role_category is one of the allowed values
            const allowedRoleCategories = ['direction', 'writing', 'production', 'music', 'technical', 'art'] as const;
            const roleCategory = allowedRoleCategories.includes(crewMember.role_category as any) 
              ? crewMember.role_category as 'direction' | 'writing' | 'production' | 'music' | 'technical' | 'art'
              : 'technical';
              
            return {
              id: crewMember.id,
              person_id: crewMember.person?.id,
              person_name: crewMember.person?.name || '',
              role_title: crewMember.role_title || '',
              role_category: roleCategory,
              display_order: crewMember.display_order || 0,
              bio: crewMember.person?.bio || '',
              specialty: crewMember.person?.specialty || '',
              profile_image_url: crewMember.person?.profile_image_url || ''
            };
          }));
        }
      } catch (error: any) {
        console.error("Failed to fetch movie:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load movie data",
          variant: "destructive",
        });
      } finally {
        setFetchingMovie(false);
      }
    };

    fetchMovieData();
  }, [editId, toast]);

  useEffect(() => {
    console.log('🔄 Form population useEffect triggered. Movie:', movie ? 'present' : 'null');
    if (movie) {
      console.log('🔄 Populating form with movie data:', movie);
      console.log('🔄 Movie platform_status:', movie.platform_status);
      
      try {
        // Prepare release date in correct format for date input (YYYY-MM-DD)
        let formattedReleaseDate = "";
        if (movie.release_date) {
          try {
            const date = new Date(movie.release_date);
            formattedReleaseDate = date.toISOString().split('T')[0];
            console.log('📅 Formatted release date:', movie.release_date, '->', formattedReleaseDate);
          } catch (error) {
            console.warn('⚠️ Error formatting release date:', movie.release_date, error);
          }
        }
        
        const formData = {
          title: movie.title || "",
          tenant_id: movie.tenant_id || "",
          city: (movie as any).city || "",
          synopsis: movie.synopsis || "",
          short_description: movie.short_description || "",
          tagline: movie.tagline || "",
          poster_url: movie.poster_url || "",
          backdrop_url: movie.backdrop_url || "",
          poster_file: undefined,
          backdrop_file: undefined,
          trailer_url: movie.trailer_url || "",
          genres: Array.isArray(movie.genres) ? movie.genres : [],
          duration_minutes: toNumber(movie.duration_minutes, 0),
          release_date: formattedReleaseDate,
          rating: movie.rating || "",
          cbfc_certificate: movie.cbfc_certificate || "",
          languages: Array.isArray(movie.languages) ? movie.languages : [],
          formats: Array.isArray(movie.formats) ? movie.formats : [],
          countries: Array.isArray(movie.countries) ? movie.countries : [],
          platform_status: movie.platform_status || "coming_soon",
          suggested_base_price_min: toNumber(movie.suggested_base_price_min, 0),
          suggested_base_price_max: toNumber(movie.suggested_base_price_max, 0),
          production_houses: Array.isArray(movie.production_houses) ? movie.production_houses : [],
          distributors: Array.isArray(movie.distributors) ? movie.distributors : [],
          budget: toNumber(movie.budget, 0),
          meta_title: movie.meta_title || "",
          meta_description: movie.meta_description || "",
          keywords: Array.isArray(movie.keywords) ? movie.keywords : [],
          is_active: movie.is_active ?? true,
          is_featured: movie.is_featured ?? false,
          is_trending: movie.is_trending ?? false,
          news_reviews: Array.isArray((movie as any).news_reviews) ? (movie as any).news_reviews : [],
          movie_songs: Array.isArray((movie as any).movie_songs) ? (movie as any).movie_songs : [],
          gallery_images: Array.isArray((movie as any).gallery_images) ? (movie as any).gallery_images : [],
        };
        
        console.log('🔄 Form data being set:', formData);
        console.log('🔄 Platform status being set:', formData.platform_status);
        
        form.reset(formData);

      // Initialize cast and crew data
      if (movie.cast) {
        setCastMembers(movie.cast.map(cast => {
          // Ensure role_type is one of the allowed values
          const allowedRoleTypes = ['lead', 'supporting', 'special_appearance', 'cameo'] as const;
          const roleType = allowedRoleTypes.includes(cast.role_type as any) 
            ? cast.role_type as 'lead' | 'supporting' | 'special_appearance' | 'cameo'
            : 'supporting';
            
          return {
            id: cast.id,
            actor_name: cast.actor?.name,
            character_name: cast.character_name,
            role_type: roleType,
            display_order: cast.display_order,
            bio: cast.actor?.bio,
            profile_image_url: cast.actor?.profile_image_url
          };
        }));
      }
      if (movie.crew) {
        setCrewMembers(movie.crew.map(crew => {
          // Ensure role_category is one of the allowed values
          const allowedRoleCategories = ['direction', 'writing', 'production', 'music', 'technical', 'art'] as const;
          const roleCategory = allowedRoleCategories.includes(crew.role_category as any) 
            ? crew.role_category as 'direction' | 'writing' | 'production' | 'music' | 'technical' | 'art'
            : 'technical';
            
          return {
            id: crew.id,
            person_name: crew.person?.name,
            role_title: crew.role_title,
            role_category: roleCategory,
            display_order: crew.display_order,
            bio: crew.person?.bio,
            specialty: crew.person?.specialty,
            profile_image_url: crew.person?.profile_image_url
          };
        }));
      }

      // Initialize duration hours and minutes
  const totalMinutes = toNumber(movie.duration_minutes, 0);
      setDurationHours(Math.floor(totalMinutes / 60));
      setDurationMinutes(totalMinutes % 60);

        // Initialize file previews
        if (movie.poster_url) {
          const normalized = normalizeImageUrl(movie.poster_url);
          console.log('🖼️ Setting poster preview:', movie.poster_url, '->', normalized);
          setPosterPreview(normalized);
        } else {
          setPosterPreview("");
        }
        if (movie.backdrop_url) {
          const normalized = normalizeImageUrl(movie.backdrop_url);
          console.log('🖼️ Setting backdrop preview:', movie.backdrop_url, '->', normalized);
          setBackdropPreview(normalized);
        } else {
          setBackdropPreview("");
        }

        // Initialize new sections
        setNewsReviews(Array.isArray((movie as any).news_reviews) ? (movie as any).news_reviews : []);
        setMovieSongs(Array.isArray((movie as any).movie_songs) ? (movie as any).movie_songs : []);
        setGalleryImages(Array.isArray((movie as any).gallery_images) ? (movie as any).gallery_images : []);
        
        console.log('✅ Form populated successfully');
      } catch (error) {
        console.error('❌ Error populating form with movie data:', error);
        toast({
          title: "Error",
          description: "Failed to populate form with movie data",
          variant: "destructive",
        });
      }
    }
  }, [movie, form, toast]);

  // Fetch tenants for selection
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('accessToken');
        if (!token || !user) {
          console.warn('No authentication for fetching tenants');
          return;
        }

        console.log('🏢 Fetching tenants in movie form');
        const tenantData = await listTenants();
        console.log('✅ Tenants fetched in movie form:', tenantData?.length || 0);
        setTenants(tenantData || []);
      } catch (error) {
        console.error("Failed to fetch tenants:", error);
        toast({
          title: "Error",
          description: "Failed to load tenants",
          variant: "destructive",
        });
      }
    };
    
    if (user) {
      fetchTenants();
    }
  }, [toast, user]);

  // File upload handlers
  const handlePosterFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPosterPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("poster_file", file);
    }
  };

  const handleBackdropFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBackdropFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackdropPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("backdrop_file", file);
    }
  };

  const uploadFile = async (file: File, type: 'poster' | 'backdrop' | 'profile' | 'gallery'): Promise<string | null> => {
    try {
      console.log(`📤 Uploading ${type} file:`, file.name, file.size, 'bytes');
      
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/upload/single', {
        method: 'POST',
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
  console.log(`✅ ${type} upload successful:`, result);
        
        // Construct full URL for the backend image
        const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
        const isLocalDev = process.env.NODE_ENV === 'development';
        
        console.log('📤 uploadFile debug:', {
          resultUrl: result.url,
          baseUrl: baseUrl,
          nodeEnv: process.env.NODE_ENV,
          isLocalDev: isLocalDev
        });
        
        const fullImageUrl = result.url.startsWith('http') 
          ? result.url 
          : isLocalDev
            ? (() => {
                // In local development, use relative URLs (Next.js rewrite will proxy to backend)
                const finalUrl = result.url.startsWith('/') ? result.url : `/${result.url}`;
                console.log('📤 Local dev relative upload URL:', finalUrl);
                return finalUrl;
              })()
            : baseUrl && baseUrl.trim()
              ? (() => {
                  // In production, use environment variable if provided
                  const cleanBaseUrl = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
                  const finalUrl = `${cleanBaseUrl}${result.url.startsWith('/') ? result.url : `/${result.url}`}`;
                  console.log('📤 Production upload URL:', finalUrl);
                  return finalUrl;
                })()
              : (() => {
                  // Fallback to relative URLs
                  const finalUrl = result.url.startsWith('/') ? result.url : `/${result.url}`;
                  console.log('📤 Fallback relative upload URL:', finalUrl);
                  return finalUrl;
                })();
        
  console.log(`🖼️ Full ${type} image URL:`, fullImageUrl);
        return fullImageUrl;
      } else {
        console.error(`❌ Failed to upload ${type} file:`, result);
        toast({
          title: "Upload Error",
          description: result.error || `Failed to upload ${type} image`,
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error(`💥 Error uploading ${type} file:`, error);
      toast({
        title: "Upload Error", 
        description: `Network error uploading ${type} image`,
        variant: "destructive",
      });
      return null;
    }
  };

  // Sync cast and crew relations after creating/updating a movie
  const syncCastAndCrew = async (movieId: string) => {
    const allowedCastRoles = ['lead', 'supporting', 'special_appearance', 'cameo', 'voice', 'narrator'] as const;
    const allowedCrewCats = ['direction', 'writing', 'production', 'music', 'technical', 'art', 'cinematography', 'editing', 'sound', 'costume', 'vfx', 'stunts', 'other'] as const;

    // Decide which cast entries need creation vs update
    const castPrepared = castMembers.map((c, idx) => ({ ...c, display_order: c.display_order || idx + 1 }));
    const castToCreate = castPrepared.filter(c => !c.id && (c.actor_name || '').trim());
    const castToUpdate = castPrepared.filter(c => c.id);

    const crewPrepared = crewMembers.map((c, idx) => ({ ...c, display_order: c.display_order || idx + 1 }));
    const crewToCreate = crewPrepared.filter(c => !c.id && (c.person_name || '').trim());
    const crewToUpdate = crewPrepared.filter(c => c.id);

    // Handle removals first
    for (const id of removedCastIds) {
      try { await removeMovieCast(movieId, id); } catch (e) { console.warn('Remove cast failed', id, e); }
    }
    for (const id of removedCrewIds) {
      try { await removeMovieCrew(movieId, id); } catch (e) { console.warn('Remove crew failed', id, e); }
    }

    // Handle cast creation and updates
    for (const c of castToCreate) {
      try {
        // Upload profile image if provided
        let profile_image_url = c.profile_image_url;
        if (c.profile_image instanceof File) {
          const uploaded = await uploadFile(c.profile_image, 'profile');
          if (uploaded) profile_image_url = uploaded;
        }

        // Ensure actor exists
        let actorId = c.actor_id;
        if (!actorId) {
          const actor = await createActor({
            name: c.actor_name || '',
            bio: c.bio,
            profile_image_url,
          });
          actorId = actor?.id;
        }
        if (!actorId) continue;

        // Map role type; default to 'supporting' if missing
        const role_type = allowedCastRoles.includes(c.role_type as any) ? (c.role_type as any) : 'supporting';

        // If character_name missing, use actor_name as fallback
        const character_name = (c.character_name && c.character_name.trim()) ? c.character_name : (c.actor_name || '');

        const payload: AddMovieCastPayload = {
          actor_id: actorId,
          character_name,
          role_type,
          display_order: c.display_order,
        };

        await addMovieCast(movieId, payload);
      } catch (err) {
        console.error('Failed to create cast member:', c, err);
        toast({ title: 'Cast add failed', description: `${c.actor_name} as ${c.character_name}`, variant: 'destructive' });
      }
    }

    // Handle cast updates (if any)
    for (const c of castToUpdate) {
      try {
        if (!c.id) continue;
        let actorId = c.actor_id;
        if (!actorId) {
          // Create new actor if not linked
          const actor = await createActor({
            name: c.actor_name || '',
            bio: c.bio,
            profile_image_url: c.profile_image_url
          });
          actorId = actor?.id;
        }
        // If a new profile image file is attached during update, upload and persist it via character_image_url
        let characterImageUrl: string | undefined = undefined;
        let nextProfileUrl = c.profile_image_url;
        if (c.profile_image instanceof File) {
          const uploaded = await uploadFile(c.profile_image, 'profile');
          if (uploaded) {
            characterImageUrl = uploaded;
            nextProfileUrl = uploaded;
          }
        }

        const role_type = allowedCastRoles.includes(c.role_type as any) ? (c.role_type as any) : 'supporting';
        const payload = {
          ...(actorId ? { actor_id: actorId } : {}),
          character_name: (c.character_name && c.character_name.trim()) ? c.character_name : (c.actor_name || ''),
          role_type,
          display_order: c.display_order,
          ...(characterImageUrl ? { character_image_url: characterImageUrl } : {}),
        };
        console.log('Updating cast member', c.id, payload);
        await updateMovieCast(movieId, c.id, payload as any);
        // Optimistically update UI preview
        if (nextProfileUrl) {
          setCastMembers(prev => prev.map(cm => cm.id === c.id ? { ...cm, profile_image_url: nextProfileUrl, profile_image: null } : cm));
        }
      } catch (err) {
        console.warn('Failed to update cast member', c, err);
        toast({ title: 'Cast update failed', description: `${c.actor_name} as ${c.character_name}`, variant: 'destructive' });
      }
    }

    // Handle crew creation and updates
    for (const m of crewToCreate) {
      try {
        let profile_image_url = m.profile_image_url;
        if (m.profile_image instanceof File) {
          const uploaded = await uploadFile(m.profile_image, 'profile');
          if (uploaded) profile_image_url = uploaded;
        }

        let personId = m.person_id;
        if (!personId) {
          const person = await createCrewPerson({
            name: m.person_name || '',
            bio: m.bio,
            specialty: m.specialty,
            profile_image_url,
          });
          personId = person?.id;
        }
        if (!personId) continue;

        const role_category = allowedCrewCats.includes(m.role_category as any) ? (m.role_category as any) : 'other';
        const role_title = (m.role_title && m.role_title.trim()) ? m.role_title : 'Contributor';
        const department = allowedCrewCats.includes(m.role_category as any) ? undefined : (m.role_category as any);

        const payload: AddMovieCrewPayload = {
          person_id: personId,
          role_category,
          role_title,
          display_order: m.display_order,
          ...(department ? { department } : {}),
        };

        await addMovieCrew(movieId, payload);
      } catch (err) {
        console.error('Failed to create crew member:', m, err);
        toast({ title: 'Crew add failed', description: `${m.person_name} • ${m.role_title}`, variant: 'destructive' });
      }
    }

    // Handle crew updates
    for (const m of crewToUpdate) {
      try {
        if (!m.id) continue;
        let personId = m.person_id;
        // Track latest profile image URL for optimistic UI update
        let nextProfileUrl = m.profile_image_url;
        if (!personId) {
          // Create new crew person if not linked
          const person = await createCrewPerson({
            name: m.person_name || '',
            bio: m.bio,
            specialty: m.specialty,
            profile_image_url: m.profile_image_url
          });
          personId = person?.id;
        } else {
          // Update existing person with current details
          // If a new profile image file is attached during update, upload it first
          if (m.profile_image instanceof File) {
            const uploaded = await uploadFile(m.profile_image, 'profile');
            if (uploaded) nextProfileUrl = uploaded;
          }

          await updateCrewPerson(personId, {
            name: m.person_name || '',
            bio: m.bio,
            specialty: m.specialty,
            profile_image_url: nextProfileUrl
          });
        }
        // Optimistically update UI preview
        if (nextProfileUrl) {
          setCrewMembers(prev => prev.map(cm => cm.id === m.id ? { ...cm, profile_image_url: nextProfileUrl, profile_image: null } : cm));
        }
        const role_category = allowedCrewCats.includes(m.role_category as any) ? (m.role_category as any) : 'other';
        const role_title = (m.role_title && m.role_title.trim()) ? m.role_title : 'Contributor';
        const department = allowedCrewCats.includes(m.role_category as any) ? undefined : (m.role_category as any);
        
        const payload: Partial<AddMovieCrewPayload> = {
          ...(personId ? { person_id: personId } : {}),
          role_category,
          role_title,
          display_order: m.display_order,
          ...(department ? { department } : {}),
        };
        console.log('Updating crew member', m.id, payload);
        await updateMovieCrew(movieId, m.id, payload as any);
      } catch (err) {
        console.warn('Failed to update crew member', m, err);
        toast({ title: 'Crew update failed', description: `${m.person_name} • ${m.role_title}`, variant: 'destructive' });
      }
    }
  };

  const onSubmit = async (values: MovieFormValues) => {
    setLoading(true);
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      console.log('🔑 Current access token:', token ? 'Present' : 'Missing');
      
      // Upload files first if they exist
      let posterUrl = values.poster_url;
      let backdropUrl = values.backdrop_url;

      if (posterFile) {
        const uploadedPosterUrl = await uploadFile(posterFile, 'poster');
        if (uploadedPosterUrl) {
          posterUrl = uploadedPosterUrl;
          // Update preview with uploaded URL and clear file
          setPosterPreview(uploadedPosterUrl);
          setPosterFile(null);
          form.setValue("poster_url", uploadedPosterUrl);
          form.setValue("poster_file", undefined);
        }
      }

      if (backdropFile) {
        const uploadedBackdropUrl = await uploadFile(backdropFile, 'backdrop');
        if (uploadedBackdropUrl) {
          backdropUrl = uploadedBackdropUrl;
          // Update preview with uploaded URL and clear file
          setBackdropPreview(uploadedBackdropUrl);
          setBackdropFile(null);
          form.setValue("backdrop_url", uploadedBackdropUrl);
          form.setValue("backdrop_file", undefined);
        }
      }

      // Upload gallery images
      const processedGalleryImages = await Promise.all(
        galleryImages.map(async (image) => {
          let imageUrl = image.image_url;
          if (image.image_file) {
            const uploadedUrl = await uploadFile(image.image_file, 'gallery');
            if (uploadedUrl) {
              imageUrl = uploadedUrl;
            }
          }
          return {
            name: image.name,
            image_url: imageUrl,
            type: image.type,
            display_order: image.display_order
          };
        })
      );

      // Prepare payload for API
      let payload: CreateMoviePayload = {
        ...values,
        city: values.city,
        poster_url: posterUrl,
        backdrop_url: backdropUrl,
        tenant_id: values.tenant_id,  // Explicitly ensure tenant_id is included
        news_reviews: newsReviews,
        movie_songs: movieSongs,
        gallery_images: processedGalleryImages
      } as CreateMoviePayload;

      console.log('🎬 Movie payload with tenant_id:', {
        tenant_id: values.tenant_id,
        title: values.title,
        full_payload: payload
      });

      // Remove empty string fields to avoid storing blanks
      payload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => {
          if (typeof v === 'string') return v.trim() !== '';
          return true;
        })
      ) as CreateMoviePayload;

      // Remove file fields from payload as they're not part of the API
      delete (payload as any).poster_file;
      delete (payload as any).backdrop_file;

      console.log('📦 Movie payload:', payload);
      
      let result;
      if (movie) {
        console.log('🔄 Updating existing movie:', movie.id);
        console.log('🔄 Current movie state:', movie);
        console.log('🔄 Payload being sent:', payload);
        result = await updateMovie(movie.id, payload);
        console.log('🔄 Update result:', result);
        // Create any new cast/crew relations
        await syncCastAndCrew(movie.id);
        // Re-fetch to ensure fresh data from server (and relations)
        try {
          const refreshed = await getMovie(movie.id, true);
          console.log('🔄 Refetched movie after update:', refreshed);
          setMovie(refreshed);
        } catch (refetchErr) {
          console.warn('⚠️ Failed to refetch movie after update, using response:', refetchErr);
          if (result) setMovie(result);
        }
      } else {
        console.log('✨ Creating new movie');
        result = await createMovie(payload);
        // After create, attach cast/crew then refetch
        if (result?.id) {
          await syncCastAndCrew(result.id);
          try {
            const refreshed = await getMovie(result.id, true);
            setMovie(refreshed);
          } catch {}
        }
      }
      
      console.log('✅ Movie operation completed:', result);
      
      // Clear file states after successful submission
      setPosterFile(null);
      setBackdropFile(null);
  setRemovedCastIds([]);
  setRemovedCrewIds([]);
      
      toast({
        title: "Success",
        description: movie ? "The changes have been updated." : "Movie created successfully",
      });
      onSuccess();
    } catch (error) {
      console.error("Error saving movie:", error);
      const errorMessage = error instanceof Error ? error.message : "Network error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addArrayItem = (field: keyof MovieFormValues, value: string) => {
    const currentValue = form.getValues(field) as string[];
    if (!currentValue.includes(value) && value.trim()) {
      form.setValue(field, [...currentValue, value.trim()]);
    }
  };

  const removeArrayItem = (field: keyof MovieFormValues, index: number) => {
    const currentValue = form.getValues(field) as string[];
    form.setValue(field, currentValue.filter((_, i) => i !== index));
  };

  const ArrayInputField = ({ 
    field, 
    label, 
    options 
  }: { 
    field: keyof MovieFormValues; 
    label: string; 
    options?: string[];
  }) => {
    const [inputValue, setInputValue] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);
    const currentValue = form.watch(field) as string[];

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex gap-2">
          {options && !showCustomInput ? (
            <>
              <Select
                value=""
                onValueChange={(value) => {
                  if (value === 'custom') {
                    setShowCustomInput(true);
                  } else {
                    addArrayItem(field, value);
                  }
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {options
                    .filter(option => !currentValue.includes(option))
                    .map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  <SelectItem value="custom">+ Add Custom {label.slice(0, -1)}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCustomInput(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Add custom ${label.toLowerCase().slice(0, -1)}`}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (inputValue.trim()) {
                      addArrayItem(field, inputValue.trim());
                      setInputValue("");
                      if (options) setShowCustomInput(false);
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (inputValue.trim()) {
                    addArrayItem(field, inputValue.trim());
                    setInputValue("");
                    if (options) setShowCustomInput(false);
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
              {options && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCustomInput(false);
                    setInputValue("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {currentValue.map((item, index) => (
            <Badge key={index} variant="secondary">
              {item}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-2"
                onClick={() => removeArrayItem(field, index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  if (fetchingMovie) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading movie data...</p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-9 w-full h-auto">
            <TabsTrigger value="basic" className="text-sm">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Basic Info
              </div>
            </TabsTrigger>
            <TabsTrigger value="media" className="text-sm">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Media
              </div>
            </TabsTrigger>
            <TabsTrigger value="content" className="text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Content
              </div>
            </TabsTrigger>
            <TabsTrigger value="castcrew" className="text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Cast & Crew
              </div>
            </TabsTrigger>
            <TabsTrigger value="production" className="text-sm">
              <div className="flex items-center gap-2">
                <Factory className="h-4 w-4" />
                Production
              </div>
            </TabsTrigger>
            <TabsTrigger value="marketing" className="text-sm">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                Marketing
              </div>
            </TabsTrigger>
            <TabsTrigger value="newsreviews" className="text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                News/Reviews
              </div>
            </TabsTrigger>
            <TabsTrigger value="songs" className="text-sm">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Songs
              </div>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="text-sm">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Gallery
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Movie Title *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter movie title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tenant_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant *</FormLabel>
                      <Select 
                        key={movie?.id || 'new'} 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a tenant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tenants.map((tenant) => (
                            <SelectItem key={tenant.tenant_id} value={tenant.tenant_id}>
                              {tenant.name} ({tenant.tenant_id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter movie tagline" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="short_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Brief description (2-3 lines)"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Duration *
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Input 
                                type="number" 
                                value={durationHours}
                                onChange={(e) => {
                                  const hours = parseInt(e.target.value) || 0;
                                  setDurationHours(hours);
                                  field.onChange(hours * 60 + durationMinutes);
                                }}
                                placeholder="2"
                                className="w-16"
                                min="0"
                              />
                              <span className="text-sm text-muted-foreground">hrs</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Input 
                                type="number" 
                                value={durationMinutes}
                                onChange={(e) => {
                                  const minutes = parseInt(e.target.value) || 0;
                                  setDurationMinutes(minutes);
                                  field.onChange(durationHours * 60 + minutes);
                                }}
                                placeholder="30"
                                className="w-16"
                                min="0"
                                max="59"
                              />
                              <span className="text-sm text-muted-foreground">mins</span>
                            </div>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({durationHours * 60 + durationMinutes} min total)
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cbfc_certificate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CBFC Certificate</FormLabel>
                        <Select 
                          key={movie?.id || 'new'} 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select certificate" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CERTIFICATES.map((cert) => (
                              <SelectItem key={cert} value={cert}>
                                {cert}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="platform_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform Status</FormLabel>
                        <Select 
                          key={movie?.id || 'new'} 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="coming_soon">Coming Soon</SelectItem>
                            <SelectItem value="advance_booking">Advance Booking</SelectItem>
                            <SelectItem value="now_showing">Now Showing</SelectItem>
                            <SelectItem value="running_successfully">Running Successfully</SelectItem>
                            <SelectItem value="closing_soon">Closing Soon</SelectItem>
                            <SelectItem value="ended">Ended</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="release_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Release Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />
                
                <ArrayInputField 
                  field="genres" 
                  label="Genres" 
                  options={GENRES}
                />
                
                <ArrayInputField 
                  field="languages" 
                  label="Languages" 
                  options={LANGUAGES}
                />
                
                <ArrayInputField 
                  field="formats" 
                  label="Formats" 
                  options={FORMATS}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ArrayInputField 
                    field="countries" 
                    label="Release Countries" 
                    options={COUNTRIES}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Release City *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter primary city (e.g., Mumbai)" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Assets Tab */}
          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Media Assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Poster Upload */}
                <div className="space-y-2">
                  <Label>Poster Image</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePosterFileChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                      />
                    </div>
                    {posterPreview && (
                      <div className="relative">
                        <Image
                          src={posterPreview}
                          alt="Poster preview"
                          width={60}
                          height={90}
                          className="rounded object-cover border"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 p-0"
                          onClick={() => {
                            setPosterFile(null);
                            setPosterPreview("");
                            form.setValue("poster_file", undefined);
                            form.setValue("poster_url", "");
                          }}
                        >
                          <X className="h-3 w-3 text-white" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recommended: 300x450 pixels, JPG/PNG format, max 5MB
                  </p>
                </div>

                {/* Backdrop Upload */}
                <div className="space-y-2">
                  <Label>Backdrop Image</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleBackdropFileChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                      />
                    </div>
                    {backdropPreview && (
                      <div className="relative">
                        <Image
                          src={backdropPreview}
                          alt="Backdrop preview"
                          width={120}
                          height={67}
                          className="rounded object-cover border"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 p-0"
                          onClick={() => {
                            setBackdropFile(null);
                            setBackdropPreview("");
                            form.setValue("backdrop_file", undefined);
                            form.setValue("backdrop_url", "");
                          }}
                        >
                          <X className="h-3 w-3 text-white" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recommended: 1920x1080 pixels, JPG format, max 5MB
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="trailer_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trailer URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://youtube.com/watch?v=..." />
                      </FormControl>
                      <FormDescription>
                        YouTube, Vimeo, or direct video URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Details Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="synopsis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Synopsis</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Detailed plot summary..."
                          rows={6}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* News & Reviews Tab */}
          <TabsContent value="newsreviews" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>News & Reviews</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewsReviews([...newsReviews, {
                        title: "",
                        youtube_url: "",
                        source: "",
                        published_date: ""
                      }]);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add News/Review
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {newsReviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No news or reviews added yet</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setNewsReviews([{
                          title: "",
                          youtube_url: "",
                          source: "",
                          published_date: ""
                        }]);
                      }}
                    >
                      Add First News/Review
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {newsReviews.map((item, index) => (
                      <Card key={index} className="border-2 border-dashed">
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">News/Review #{index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = newsReviews.filter((_, i) => i !== index);
                                setNewsReviews(updated);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Title</Label>
                              <Input
                                value={item.title}
                                onChange={(e) => {
                                  const updated = [...newsReviews];
                                  updated[index].title = e.target.value;
                                  setNewsReviews(updated);
                                }}
                                placeholder="Review or news title"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Source/Channel</Label>
                              <Input
                                value={item.source}
                                onChange={(e) => {
                                  const updated = [...newsReviews];
                                  updated[index].source = e.target.value;
                                  setNewsReviews(updated);
                                }}
                                placeholder="Channel or source name"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>YouTube URL</Label>
                            <Input
                              value={item.youtube_url}
                              onChange={(e) => {
                                const updated = [...newsReviews];
                                updated[index].youtube_url = e.target.value;
                                setNewsReviews(updated);
                              }}
                              placeholder="https://youtube.com/watch?v=..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Published Date</Label>
                            <Input
                              type="date"
                              value={item.published_date}
                              onChange={(e) => {
                                const updated = [...newsReviews];
                                updated[index].published_date = e.target.value;
                                setNewsReviews(updated);
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Movie Songs Tab */}
          <TabsContent value="songs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Movie Songs</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMovieSongs([...movieSongs, {
                        name: "",
                        youtube_url: "",
                        duration: ""
                      }]);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Song
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {movieSongs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mic className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No songs added yet</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setMovieSongs([{
                          name: "",
                          youtube_url: "",
                          duration: ""
                        }]);
                      }}
                    >
                      Add First Song
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {movieSongs.map((song, index) => (
                      <Card key={index} className="border-2 border-dashed">
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Song #{index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = movieSongs.filter((_, i) => i !== index);
                                setMovieSongs(updated);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Song Name</Label>
                              <Input
                                value={song.name}
                                onChange={(e) => {
                                  const updated = [...movieSongs];
                                  updated[index].name = e.target.value;
                                  setMovieSongs(updated);
                                }}
                                placeholder="Song title"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Duration</Label>
                              <Input
                                value={song.duration}
                                onChange={(e) => {
                                  const updated = [...movieSongs];
                                  updated[index].duration = e.target.value;
                                  setMovieSongs(updated);
                                }}
                                placeholder="3:45"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>YouTube URL</Label>
                            <Input
                              value={song.youtube_url}
                              onChange={(e) => {
                                const updated = [...movieSongs];
                                updated[index].youtube_url = e.target.value;
                                setMovieSongs(updated);
                              }}
                              placeholder="https://youtube.com/watch?v=..."
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gallery & Posters</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setGalleryImages([...galleryImages, {
                        name: "",
                        image_url: "",
                        type: "poster" as const,
                        display_order: galleryImages.length + 1,
                        image_file: null
                      }]);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {galleryImages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No gallery images added yet</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setGalleryImages([{
                          name: "",
                          image_url: "",
                          type: "poster" as const,
                          display_order: 1,
                          image_file: null
                        }]);
                      }}
                    >
                      Add First Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {galleryImages.map((image, index) => (
                      <Card key={index} className="border-2 border-dashed">
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Image #{index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = galleryImages.filter((_, i) => i !== index);
                                setGalleryImages(updated);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Image Name</Label>
                              <Input
                                value={image.name}
                                onChange={(e) => {
                                  const updated = [...galleryImages];
                                  updated[index].name = e.target.value;
                                  setGalleryImages(updated);
                                }}
                                placeholder="Image name or description"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <Select
                                value={image.type}
                                onValueChange={(value: "poster" | "still" | "behind_scenes") => {
                                  const updated = [...galleryImages];
                                  updated[index].type = value;
                                  setGalleryImages(updated);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="poster">Poster</SelectItem>
                                  <SelectItem value="still">Movie Still</SelectItem>
                                  <SelectItem value="behind_scenes">Behind the Scenes</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Upload Image</Label>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const updated = [...galleryImages];
                                      updated[index].image_file = file;
                                      setGalleryImages(updated);
                                    }
                                  }}
                                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                />
                              </div>
                              {image.image_url && (
                                <div className="relative">
                                  <Image
                                    src={normalizeImageUrl(image.image_url)}
                                    alt="Gallery preview"
                                    width={80}
                                    height={120}
                                    className="rounded object-cover border"
                                  />
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Recommended: JPG/PNG format, max 5MB
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cast & Crew Tab */}
          <TabsContent value="castcrew" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cast Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                      Cast Members
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddCast(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Actor
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {castMembers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50 text-blue-400" />
                      <p className="text-sm">No cast members added yet</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setShowAddCast(true)}
                      >
                        Add First Actor
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {castMembers.map((cast, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            {cast.profile_image_url && (
                              <img
                                src={normalizeImageUrl(cast.profile_image_url)}
                                alt={cast.actor_name || 'Actor'}
                                className="w-10 h-12 rounded object-cover border"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder-user.jpg'; }}
                              />
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-sm">{cast.actor_name || 'Unknown Actor'}</div>
                              <div className="text-xs text-muted-foreground">
                                as {cast.character_name} ({cast.role_type})
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingCast({ ...cast, index });
                                setShowAddCast(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button type="button" variant="ghost" size="sm">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove cast member?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove {cast.actor_name} as {cast.character_name} from this movie.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => {
                                    const removed = castMembers.filter((_, i) => i !== index);
                                    setCastMembers(removed);
                                    // If this cast member was already persisted, remove on server immediately
                                    if (cast.id && movie?.id) {
                                      (async () => {
                                        try {
                                          await removeMovieCast(movie.id, cast.id!);
                                        } catch (err) {
                                          console.warn('Failed to remove cast on server', cast.id, err);
                                          // fallback: queue removal for syncCastAndCrew
                                          setRemovedCastIds((prev) => [...prev, cast.id!]);
                                        }
                                      })();
                                    } else if (cast.id) {
                                      setRemovedCastIds((prev) => [...prev, cast.id!]);
                                    }
                                  }}>Remove</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add/Edit Cast Form */}
                  {showAddCast && (
                    <Card className="border-2 border-dashed">
                      <CardHeader>
                        <CardTitle className="text-sm">
                          {editingCast ? 'Edit Cast Member' : 'Add Cast Member'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <CastCrewForm
                          type="cast"
                          initialData={editingCast}
                          onSave={(data) => {
                            if (editingCast && editingCast.index !== undefined) {
                              const existing = castMembers[editingCast.index];
                              const next = [...castMembers];
                              // Preserve id when editing so the entry remains linked to persisted record
                              next.splice(editingCast.index, 1, { ...existing, ...data, id: existing?.id });
                              setCastMembers(next);
                            } else {
                              setCastMembers([...castMembers, { ...data, display_order: castMembers.length + 1 }]);
                            }
                            setShowAddCast(false);
                            setEditingCast(null);
                          }}
                          onCancel={() => {
                            setShowAddCast(false);
                            setEditingCast(null);
                          }}
                        />
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              {/* Crew Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-purple-600" />
                      Crew Members
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddCrew(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Crew
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {crewMembers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Video className="h-8 w-8 mx-auto mb-2 opacity-50 text-purple-400" />
                      <p className="text-sm">No crew members added yet</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setShowAddCrew(true)}
                      >
                        Add First Crew Member
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {crewMembers.map((crew, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            {crew.profile_image_url && (
                              <img
                                src={normalizeImageUrl(crew.profile_image_url)}
                                alt={crew.person_name || 'Crew'}
                                className="w-10 h-12 rounded object-cover border"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder-user.jpg'; }}
                              />
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-sm">{crew.person_name || 'Unknown Person'}</div>
                              <div className="text-xs text-muted-foreground">
                                {crew.role_title} ({crew.role_category})
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingCrew({ ...crew, index });
                                setShowAddCrew(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button type="button" variant="ghost" size="sm">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove crew member?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove {crew.person_name} ({crew.role_title}) from this movie.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => {
                                        const remaining = crewMembers.filter((_, i) => i !== index);
                                        setCrewMembers(remaining);
                                        if (crew.id && movie?.id) {
                                          (async () => {
                                            try {
                                              await removeMovieCrew(movie.id, crew.id!);
                                            } catch (err) {
                                              console.warn('Failed to remove crew on server', crew.id, err);
                                              setRemovedCrewIds((prev) => [...prev, crew.id!]);
                                            }
                                          })();
                                        } else if (crew.id) {
                                          setRemovedCrewIds((prev) => [...prev, crew.id!]);
                                        }
                                  }}>Remove</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add/Edit Crew Form */}
                  {showAddCrew && (
                    <Card className="border-2 border-dashed">
                      <CardHeader>
                        <CardTitle className="text-sm">
                          {editingCrew ? 'Edit Crew Member' : 'Add Crew Member'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <CastCrewForm
                          type="crew"
                          initialData={editingCrew}
                          onSave={(data) => {
                            if (editingCrew && editingCrew.index !== undefined) {
                              const existing = crewMembers[editingCrew.index];
                              const next = [...crewMembers];
                              // Preserve id when editing so the entry remains linked to persisted record
                              next.splice(editingCrew.index, 1, { ...existing, ...data, id: existing?.id });
                              setCrewMembers(next);
                            } else {
                              setCrewMembers([...crewMembers, { ...data, display_order: crewMembers.length + 1 }]);
                            }
                            setShowAddCrew(false);
                            setEditingCrew(null);
                          }}
                          onCancel={() => {
                            setShowAddCrew(false);
                            setEditingCrew(null);
                          }}
                        />
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Production Tab */}
          <TabsContent value="production" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Production Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ArrayInputField 
                  field="production_houses" 
                  label="Production Houses"
                />
                
                <ArrayInputField 
                  field="distributors" 
                  label="Distributors"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                            placeholder="0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label>Pricing Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="suggested_base_price_min"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value)}
                                placeholder="Min price"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="suggested_base_price_max"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value)}
                                placeholder="Max price"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketing Tab */}
          <TabsContent value="marketing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SEO & Marketing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="meta_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="SEO optimized title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meta_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="SEO meta description (150-160 characters)"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <ArrayInputField 
                  field="keywords" 
                  label="SEO Keywords"
                />

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Status Settings</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Active</FormLabel>
                            <FormDescription className="text-xs">
                              Movie is visible to users
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Featured</FormLabel>
                            <FormDescription className="text-xs">
                              Show in featured section
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_trending"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Trending</FormLabel>
                            <FormDescription className="text-xs">
                              Mark as trending movie
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : movie ? "Update Movie" : "Create Movie"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Cast & Crew Form Component
interface CastCrewFormProps {
  type: 'cast' | 'crew';
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

function CastCrewForm({ type, initialData, onSave, onCancel }: CastCrewFormProps) {
  const [formData, setFormData] = useState(
    type === 'cast' 
      ? {
          actor_id: initialData?.actor_id || '',
          actor_name: initialData?.actor_name || '',
          character_name: initialData?.character_name || '',
          role_type: initialData?.role_type || 'lead',
          bio: initialData?.bio || '',
          profile_image: null as File | null,
          profile_image_url: initialData?.profile_image_url || ''
        }
      : {
          person_id: initialData?.person_id || '',
          person_name: initialData?.person_name || '',
          role_title: initialData?.role_title || '',
          role_category: initialData?.role_category || 'direction',
          bio: initialData?.bio || '',
          specialty: initialData?.specialty || '',
          profile_image: null as File | null,
          profile_image_url: initialData?.profile_image_url || ''
        }
  );

  const [imagePreview, setImagePreview] = useState(
    initialData?.profile_image_url || null
  );

  // Simple search for existing actors/crew
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        if (!query || query.trim().length < 2) { setSearchResults([]); return; }
        if (type === 'cast') {
          const res = await listActors({ search: query, limit: 5 });
          if (!active) return;
          setSearchResults(res?.data || []);
        } else {
          const res = await listCrewPersons({ search: query, limit: 5 });
          if (!active) return;
          setSearchResults(res?.data || []);
        }
      } catch (e) {
        setSearchResults([]);
      }
    };
    run();
    return () => { active = false; };
  }, [type, query]);

  const [showCustomRoleType, setShowCustomRoleType] = useState(false);
  const [showCustomDepartment, setShowCustomDepartment] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, profile_image: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Only require the name for cast/crew entries. Other fields are optional.
    if (type === 'cast') {
      if (!formData.actor_name || !formData.actor_name.trim()) {
        return;
      }
    } else {
      if (!formData.person_name || !formData.person_name.trim()) {
        return;
      }
    }

    // Pass back the id if present so parent can decide update vs create
    onSave({ ...formData });
  };

  return (
    <div
      className="space-y-3"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          // Prevent Enter from submitting the parent movie form
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      role="form"
      aria-label={type === 'cast' ? 'Cast form' : 'Crew form'}
    >
      {type === 'cast' ? (
        <>
          {/* Quick search for existing actor */}
          <div className="space-y-2">
            <Label>Select Existing Actor (optional)</Label>
            <Input
              placeholder="Search actor by name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="border rounded max-h-40 overflow-auto text-sm">
                {searchResults.map((a: any) => (
                  <button
                    key={a.id}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-muted"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        actor_id: a.id,
                        actor_name: a.name,
                        profile_image_url: a.profile_image_url || formData.profile_image_url,
                      } as any);
                      setQuery("");
                      setSearchResults([]);
                    }}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Profile Image Upload */}
          <div className="space-y-2">
            <Label>Profile Image</Label>
            <div className="flex items-start gap-4">
              {imagePreview && (
                <div className="w-16 h-20 rounded-lg overflow-hidden border">
                  <img 
                    src={imagePreview} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder-user.jpg'; }}
                  />
                </div>
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or WebP (max 5MB)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Actor Name</Label>
              <Input
                value={formData.actor_name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setFormData({ ...formData, actor_name: newName, actor_id: newName !== initialData?.actor_name ? undefined : formData.actor_id });
                }}
                placeholder="Enter actor's name"
              />
            </div>
            <div className="space-y-2">
              <Label>Character Name</Label>
              <Input
                value={formData.character_name}
                onChange={(e) => setFormData({ ...formData, character_name: e.target.value })}
                placeholder="Character they play"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Role Type</Label>
            {!showCustomRoleType ? (
              <div className="flex gap-2">
                <Select
                  value={formData.role_type}
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setShowCustomRoleType(true);
                      setFormData({ ...formData, role_type: '' });
                    } else {
                      setFormData({ ...formData, role_type: value });
                    }
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select role type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead Role</SelectItem>
                    <SelectItem value="supporting">Supporting Role</SelectItem>
                    <SelectItem value="special_appearance">Special Appearance</SelectItem>
                    <SelectItem value="cameo">Cameo</SelectItem>
                    <SelectItem value="antagonist">Antagonist</SelectItem>
                    <SelectItem value="comic_relief">Comic Relief</SelectItem>
                    <SelectItem value="villain">Villain</SelectItem>
                    <SelectItem value="narrator">Narrator</SelectItem>
                    <SelectItem value="custom">+ Add Custom Role</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={formData.role_type}
                  onChange={(e) => setFormData({ ...formData, role_type: e.target.value })}
                  placeholder="Enter custom role type"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCustomRoleType(false);
                    setFormData({ ...formData, role_type: 'lead' });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Biography</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Brief biography or description of the actor..."
              rows={3}
            />
          </div>
        </>
      ) : (
        <>
          {/* Quick search for existing crew person */}
          <div className="space-y-2">
            <Label>Select Existing Crew (optional)</Label>
            <Input
              placeholder="Search crew by name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="border rounded max-h-40 overflow-auto text-sm">
                {searchResults.map((p: any) => (
                  <button
                    key={p.id}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-muted"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        person_id: p.id,
                        person_name: p.name,
                        profile_image_url: p.profile_image_url || formData.profile_image_url,
                      } as any);
                      setQuery("");
                      setSearchResults([]);
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Profile Image Upload */}
          <div className="space-y-2">
            <Label>Profile Image</Label>
            <div className="flex items-start gap-4">
              {imagePreview && (
                <div className="w-16 h-20 rounded-lg overflow-hidden border">
                  <img 
                    src={imagePreview} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or WebP (max 5MB)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Person Name</Label>
              <Input
                value={formData.person_name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setFormData({ ...formData, person_name: newName, person_id: newName !== initialData?.person_name ? undefined : formData.person_id });
                }}
                placeholder="Enter crew member's name"
              />
            </div>
            <div className="space-y-2">
              <Label>Role/Position</Label>
              <Input
                value={formData.role_title}
                onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                placeholder="e.g., Director, Cinematographer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              {!showCustomDepartment ? (
                <div className="flex gap-2">
                  <Select
                    value={formData.role_category}
                    onValueChange={(value) => {
                      if (value === 'custom') {
                        setShowCustomDepartment(true);
                        setFormData({ ...formData, role_category: '' });
                      } else {
                        setFormData({ ...formData, role_category: value });
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direction">Direction</SelectItem>
                      <SelectItem value="writing">Writing</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="art">Art</SelectItem>
                      <SelectItem value="cinematography">Cinematography</SelectItem>
                      <SelectItem value="editing">Editing</SelectItem>
                      <SelectItem value="sound">Sound</SelectItem>
                      <SelectItem value="costume">Costume</SelectItem>
                      <SelectItem value="vfx">Visual Effects</SelectItem>
                      <SelectItem value="stunts">Stunts</SelectItem>
                      <SelectItem value="custom">+ Add Custom Department</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={formData.role_category}
                    onChange={(e) => setFormData({ ...formData, role_category: e.target.value })}
                    placeholder="Enter custom department"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCustomDepartment(false);
                      setFormData({ ...formData, role_category: 'direction' });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Specialty</Label>
              <Input
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="e.g., Action Director, VFX Supervisor"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Biography</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Brief biography or description of the crew member..."
              rows={3}
            />
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={handleSave}>
          {initialData ? 'Update' : 'Add'} {type === 'cast' ? 'Actor' : 'Crew Member'}
        </Button>
      </div>
    </div>
  );
}
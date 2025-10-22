"use client";

import { useEffect, useState } from "react";
import { MobileMovieCard } from "@/components/customer/mobile-movie-card";
import { MobileFeaturedCarousel } from "@/components/customer/mobile-featured-carousel";
import { MobileFilterChips } from "@/components/customer/mobile-filter-chips";
import { searchMoviesByLocation, getFeaturedMovies } from "@/lib/public";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

const DEFAULT_CITY = "Bengaluru";
const genres = ["All", "Action", "Comedy", "Drama", "Sci-Fi", "Romance", "Thriller", "Animation", "Horror", "Adventure"];

export function MobileMovieBrowser() {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const [featuredMovies, setFeaturedMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState(
    (typeof window !== 'undefined' && (localStorage.getItem('app_city') || DEFAULT_CITY)) || DEFAULT_CITY
  );
  const { toast } = useToast();

  // Listen for city changes from header
  useEffect(() => {
    const handler = (e: any) => {
      const next = e?.detail || (typeof window !== 'undefined' && localStorage.getItem('app_city')) || DEFAULT_CITY;
      setSelectedCity(next);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('city-change', handler);
    }
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('city-change', handler);
    };
  }, []);

  // Fetch movies from the real API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🎬 Fetching movies for city:", selectedCity);

        // Get movies with showtimes by location
        const movieSearchResult = await searchMoviesByLocation({
          city: selectedCity,
          ...(selectedGenre !== "All" ? { genre: selectedGenre } : {})
        });

        console.log("✅ Movies fetched:", movieSearchResult);

        // Handle both direct response and nested data structure
        const movies = movieSearchResult?.movies || [];
        setAllMovies(movies);

        // Get featured movies separately
        try {
          const featured = await getFeaturedMovies({ city: selectedCity, limit: 10 });
          console.log("✅ Featured movies fetched:", featured);
          console.log("✅ Featured movies count:", featured?.length || 0);
          setFeaturedMovies(featured || []);
        } catch (featuredError) {
          console.warn("⚠️ Failed to fetch featured movies:", featuredError);
          // Continue without featured movies
        }

      } catch (error: any) {
        console.error("❌ Error fetching movies:", error);
        setError(error.message || "Failed to load movies");
        toast({
          title: "Error",
          description: "Failed to load movies. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [selectedCity, selectedGenre, toast]);

  const handleGenreFilter = (filter: string | null) => {
    setSelectedGenre(filter || "All");
  };


  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-3 text-muted-foreground">Loading movies...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <AlertCircle className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg">Failed to load movies</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured Section */}
      <section className="animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-foreground">In the spotlight</h2>
        {(featuredMovies.length > 0 || allMovies.length > 0) ? (
          <MobileFeaturedCarousel movies={featuredMovies.length > 0 ? featuredMovies : allMovies.slice(0, 5)} />
        ) : (
          <Skeleton className="w-full aspect-[16/9] md:aspect-[21/9] rounded-xl" />
        )}
      </section>

      {/* Filters */}
      <section className="animate-fade-in">
        <MobileFilterChips onFilterChange={handleGenreFilter} />
      </section>

      {/* Now Showing */}
      <section className="space-y-3">
        <h2 className="text-xl md:text-2xl font-semibold">Now Showing</h2>
        {allMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {allMovies.map((movie) => (
              <MobileMovieCard 
                key={movie.id} 
                movie={movie}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No movies currently showing</p>
          </div>
        )}
      </section>
    </div>
  );
}

"use client"

import { useEffect, useState } from "react"
import { MovieCard } from "@/components/customer/movie-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { HeroCarousel } from "@/components/shared/hero-carousel"
import { searchMoviesByLocation, getFeaturedMovies, getPopularMovies } from "@/lib/public"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { Movie } from "@/lib/types"

// Updated type to match backend Movie model
interface MovieWithShows extends Movie {
  platform_status?: string
  genres?: string[]
  is_featured?: boolean
  is_trending?: boolean
  theatres?: Array<{
    id: string
    name: string
    auditoriums: Array<{
      id: string
      name: string
      shows: Array<{
        id: string
        show_datetime: string
        pricing: Record<string, number>
      }>
    }>
  }>
}

const DEFAULT_CITY = "Mumbai" // Default city for movie search
const genres = ["All", "Action", "Comedy", "Drama", "Sci-Fi", "Romance", "Thriller", "Animation", "Horror", "Adventure"]

export function MovieBrowser() {
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [allMovies, setAllMovies] = useState<MovieWithShows[]>([])
  const [featuredMovies, setFeaturedMovies] = useState<MovieWithShows[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState(
    (typeof window !== 'undefined' && (localStorage.getItem('app_city') || DEFAULT_CITY)) || DEFAULT_CITY
  )
  const { toast } = useToast()

  // Fetch movies from the real API
  useEffect(() => {
    const handler = (e: any) => {
      const next = e?.detail || (typeof window !== 'undefined' && localStorage.getItem('app_city')) || DEFAULT_CITY
      setSelectedCity(next)
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('city-change', handler)
    }
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('city-change', handler)
    }
  }, [])

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("🎬 Fetching movies for city:", selectedCity)

        // Get movies with showtimes by location
        const movieSearchResult = await searchMoviesByLocation({
          city: selectedCity,
          ...(selectedGenre !== "All" ? { genre: selectedGenre } : {})
        })

        console.log("✅ Movies fetched:", movieSearchResult)

        if (movieSearchResult?.movies) {
          setAllMovies(movieSearchResult.movies as MovieWithShows[])
        }

        // Get featured movies separately
        try {
          const featured = await getFeaturedMovies({ city: selectedCity, limit: 10 })
          console.log("✅ Featured movies fetched:", featured)
          setFeaturedMovies(featured as MovieWithShows[])
        } catch (featuredError) {
          console.warn("⚠️ Failed to fetch featured movies:", featuredError)
          // Continue without featured movies
        }

      } catch (error: any) {
        console.error("❌ Error fetching movies:", error)
        setError(error.message || "Failed to load movies")
        toast({
          title: "Error",
          description: "Failed to load movies. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [selectedCity, selectedGenre, toast])

  const handleGenreFilter = (genre: string) => {
    setSelectedGenre(genre)
  }


  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-3 text-muted-foreground">Loading movies...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg">Failed to load movies</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* City & Genre Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-muted/30 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">City:</span>
          <Badge variant="secondary">{selectedCity}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium mr-2">Genres:</span>
          {genres.map((genre) => (
            <Badge 
              key={genre}
              variant={selectedGenre === genre ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => handleGenreFilter(genre)}
            >
              {genre}
            </Badge>
          ))}
        </div>
      </div>

      {/* Hero Carousel - Use featured movies if available, otherwise all movies */}
      <HeroCarousel movies={featuredMovies.length > 0 ? featuredMovies : allMovies.slice(0, 5)} />

      {/* Now Showing */}
      <section className="space-y-3">
        <h2 className="text-xl md:text-2xl font-semibold">Now Showing</h2>
        {allMovies.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
            {allMovies.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={{ 
                  id: movie.id, 
                  title: movie.title, 
                  posterUrl: movie.poster_url || '/placeholder-movie.jpg',
                  genres: movie.genres,
                  rating: movie.rating,
                  duration: movie.duration_minutes
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No movies currently showing</p>
          </div>
        )}
      </section>


      {/* Empty State */}
      {!loading && allMovies.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 010 2h-1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 010-2h4zM6 6v14h12V6H6zM8 8v10h2V8H8zM12 8v10h2V8h-2z" />
            </svg>
            <p className="text-lg mb-2">No movies found</p>
            <p className="text-sm">Try adjusting your filters or check back later</p>
          </div>
        </div>
      )}
    </div>
  )
}

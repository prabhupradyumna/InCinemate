"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShowtimeSelector } from "@/components/customer/showtime-selector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileLayout } from "@/components/customer/mobile-layout";
import {
  Star,
  Clock,
  Calendar,
  Film,
  ArrowLeft,
  Loader2,
  Play,
} from "lucide-react";
import { getMovieDetails } from "@/lib/public";

export default function MobileMovieDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [movieData, setMovieData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const router = useRouter();

  // Fetch movie details on mount
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const data = await getMovieDetails(params.id);
        setMovieData(data);
      } catch (err: any) {
        console.error("Error fetching movie details:", err);
        setError(err.message || "Failed to load movie details");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMovieDetails();
    }
  }, [params.id]);

  // Helper functions
  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading state
  if (loading) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground text-lg">Loading movie details...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Error state
  if (error || !movieData) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-destructive text-6xl">⚠️</div>
            <h2 className="text-2xl font-bold text-foreground">Movie Not Found</h2>
            <p className="text-muted-foreground">
              {error || "Unable to load movie details"}
            </p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </MobileLayout>
    );
  }

  const { movie, theatres, total_shows } = movieData;

  return (
    <MobileLayout showBottomNav={false}>
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Movie Info */}
        <div className="grid md:grid-cols-[300px,1fr] gap-6 animate-fade-in">
          <img
            src={movie.poster_url || "/placeholder-movie.jpg"}
            alt={movie.title}
            className="w-full rounded-xl shadow-card"
          />
          
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
                {movie.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres?.map((genre: string) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              {movie.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-semibold">{movie.rating}/10</span>
                </div>
              )}
              {movie.duration_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{movie.duration_minutes} mins</span>
                </div>
              )}
              {movie.languages && movie.languages.length > 0 && (
                <Badge>{movie.languages[0]}</Badge>
              )}
            </div>

            {movie.synopsis && (
              <p className="text-muted-foreground leading-relaxed">
                {movie.synopsis}
              </p>
            )}

            {movie.cast && movie.cast.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Cast</h3>
                <p className="text-muted-foreground">{movie.cast.join(", ")}</p>
              </div>
            )}

            {movie.director && (
              <div>
                <h3 className="font-semibold mb-2">Director</h3>
                <p className="text-muted-foreground">{movie.director}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setSelectorOpen(true)}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Book Tickets
          </Button>
          {movie.trailer_url && (
            <a
              href={movie.trailer_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 border-2 border-border bg-transparent text-foreground hover:bg-secondary rounded-lg px-4 py-2 transition-all duration-300"
            >
              <Play className="h-4 w-4" />
              Watch Trailer
            </a>
          )}
        </div>

        {/* About the Movie Section */}
        {movie.synopsis && (
          <section className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
              About the movie
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {movie.synopsis}
            </p>
          </section>
        )}

        {/* Cast Section */}
        {movie.castMembers && movie.castMembers.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
              Cast
            </h3>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pb-2">
                {movie.castMembers.map((cast: any) => (
                  <div key={cast.id} className="flex-shrink-0 w-32 sm:w-auto">
                    <div className="bg-card border border-border rounded-lg p-3 hover:border-primary transition-colors">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden bg-muted mb-3">
                        {cast.actor?.profile_image_url ? (
                          <Image
                            src={cast.actor.profile_image_url}
                            alt={cast.actor.name}
                            width={96}
                            height={96}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl font-bold">
                            {cast.actor?.name?.charAt(0) || "?"}
                          </div>
                        )}
                      </div>
                      <div className="text-center space-y-1">
                        <div className="text-xs sm:text-sm font-medium text-foreground truncate">
                          {cast.actor?.name || "Unknown"}
                        </div>
                        {cast.character_name && (
                          <div className="text-xs text-muted-foreground truncate">
                            as {cast.character_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Sticky CTA for mobile */}
        <div className="fixed bottom-0 inset-x-0 p-3 md:hidden bg-background/90 backdrop-blur border-t border-border z-50">
          <div className="container mx-auto px-0">
            <Button
              onClick={() => setSelectorOpen(true)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Book Tickets
            </Button>
          </div>
        </div>

        <ShowtimeSelector
          open={selectorOpen}
          onOpenChange={setSelectorOpen}
          theatres={theatres || []}
          onSelect={(showId) => {
            setSelectorOpen(false);
            router.push(`/booking/${showId}`);
          }}
        />
      </div>
    </MobileLayout>
  );
}

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
  Mic,
  FileText,
  Camera,
  ExternalLink,
  ChevronRight,
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
            <p className="text-muted-foreground text-lg">
              Loading movie details...
            </p>
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
            <h2 className="text-2xl font-bold text-foreground">
              Movie Not Found
            </h2>
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
      <div className="space-y-6 pb-20">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
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

        {/* Crew Section */}
        {movie.crewMembers && movie.crewMembers.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
              Crew
            </h3>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pb-2">
                {movie.crewMembers.map((crew: any) => (
                  <div key={crew.id} className="flex-shrink-0 w-32 sm:w-auto">
                    <div className="bg-card border border-border rounded-lg p-3 hover:border-primary transition-colors">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden bg-muted mb-3">
                        {crew.person?.profile_image_url ? (
                          <Image
                            src={crew.person.profile_image_url}
                            alt={crew.person.name}
                            width={96}
                            height={96}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl font-bold">
                            {crew.person?.name?.charAt(0) || "?"}
                          </div>
                        )}
                      </div>
                      <div className="text-center space-y-1">
                        <div className="text-xs sm:text-sm font-medium text-foreground truncate">
                          {crew.person?.name || "Unknown"}
                        </div>
                        {crew.role_title && (
                          <div className="text-xs text-muted-foreground truncate">
                            {crew.role_title}
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

        {/* News & Reviews Section */}
        {movie.news_reviews && movie.news_reviews.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5" />
                News & Reviews
              </h3>
              <Link href={`/movie/${params.id}/news-reviews`}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-3 pb-2">
                {movie.news_reviews.map((item: any, index: number) => (
                  <div key={index} className="flex-shrink-0 w-72">
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-foreground text-sm line-clamp-2">
                            {item.title || `Review ${index + 1}`}
                          </h4>
                          {item.youtube_url && (
                            <a
                              href={item.youtube_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 ml-2"
                            >
                              <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            </a>
                          )}
                        </div>
                        {item.source && (
                          <p className="text-xs text-muted-foreground">Source: {item.source}</p>
                        )}
                        {item.published_date && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.published_date).toLocaleDateString()}
                          </p>
                        )}
                        {item.youtube_url && (
                          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                            <iframe
                              src={item.youtube_url.replace('watch?v=', 'embed/')}
                              title={item.title || `Review ${index + 1}`}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
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

        {/* Movie Songs Section */}
        {movie.movie_songs && movie.movie_songs.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Movie Songs
              </h3>
              <Link href={`/movie/${params.id}/songs`}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-3 pb-2">
                {movie.movie_songs.map((song: any, index: number) => (
                  <div key={index} className="flex-shrink-0 w-72">
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-foreground text-sm line-clamp-2">
                            {song.name || `Song ${index + 1}`}
                          </h4>
                          {song.youtube_url && (
                            <a
                              href={song.youtube_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 ml-2"
                            >
                              <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            </a>
                          )}
                        </div>
                        {song.duration && (
                          <p className="text-xs text-muted-foreground">Duration: {song.duration}</p>
                        )}
                        {song.youtube_url && (
                          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                            <iframe
                              src={song.youtube_url.replace('watch?v=', 'embed/')}
                              title={song.name || `Song ${index + 1}`}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
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

        {/* Gallery Section */}
        {movie.gallery_images && movie.gallery_images.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Gallery
              </h3>
              <Link href={`/movie/${params.id}/gallery`}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-3 pb-2">
                {movie.gallery_images.map((image: any, index: number) => (
                  <div key={index} className="flex-shrink-0 w-40">
                    <div className="group relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                      {image.image_url ? (
                        <Image
                          src={image.image_url}
                          alt={image.name || `Gallery image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300" />
                      {image.name && (
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-white text-xs font-medium truncate">{image.name}</p>
                          {image.type && (
                            <p className="text-white/70 text-xs capitalize">{image.type.replace('_', ' ')}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Production Details */}
        {(movie.production_houses?.length > 0 ||
          movie.distributors?.length > 0) && (
          <section className="space-y-4">
            <h3 className="text-2xl font-semibold text-foreground">
              Production Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
              {movie.production_houses?.length > 0 && (
                <div>
                  <span className="font-semibold text-foreground">
                    Production:{" "}
                  </span>
                  <span>{movie.production_houses.join(", ")}</span>
                </div>
              )}
              {movie.distributors?.length > 0 && (
                <div>
                  <span className="font-semibold text-foreground">
                    Distribution:{" "}
                  </span>
                  <span>{movie.distributors.join(", ")}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Important Information */}
        {movie.things_to_know?.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-2xl font-semibold text-foreground">
              Important Information
            </h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {movie.things_to_know.map((info: string, idx: number) => (
                <li key={idx}>{info}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Songs Section */}
        {movie.songs && movie.songs.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
              Songs
            </h3>
            <div className="space-y-3">
              {movie.songs.map((song: any, idx: number) => (
                <div
                  key={song.id}
                  className="bg-card/50 border border-border rounded-lg p-3 sm:p-4"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-grow space-y-2">
                      <h4 className="text-sm sm:text-base font-semibold text-foreground">
                        {song.title}
                      </h4>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {song.singers && (
                          <span>Singers: {song.singers.join(", ")}</span>
                        )}
                        {song.music_director && (
                          <span>• Music: {song.music_director}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        {movie.reviews && movie.reviews.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
              Critic Reviews
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {movie.reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="bg-card/30 border border-border/50 rounded-lg p-4"
                >
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold">
                      {review.reviewer_name?.charAt(0) || "R"}
                    </div>
                    <div className="flex-grow space-y-2">
                      <h4 className="font-semibold text-foreground text-sm sm:text-base">
                        {review.reviewer_name}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {review.review_text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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

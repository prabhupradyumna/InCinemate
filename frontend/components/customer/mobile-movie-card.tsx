"use client";

import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface Movie {
  id: string;
  title: string;
  poster_url?: string;
  rating?: string;
  genres?: string[];
  duration_minutes?: number;
  platform_status?: string;
  is_featured?: boolean;
  is_trending?: boolean;
}

interface MobileMovieCardProps {
  movie: Movie;
}

export function MobileMovieCard({ movie }: MobileMovieCardProps) {
  const router = useRouter();

  return (
    <div 
      className="group cursor-pointer animate-fade-in"
      onClick={() => router.push(`/movie/${movie.id}`)}
    >
      <div className="relative overflow-hidden rounded-lg shadow-card hover-scale">
        <img 
          src={movie.poster_url || "/placeholder-movie.jpg"} 
          alt={movie.title}
          className="w-full aspect-[2/3] object-cover"
          loading="lazy"
        />
        
        {/* Status Badges */}
        {movie.is_trending && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground shadow-glow">
            New Release
          </Badge>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/80 to-transparent p-3">
          {/* Rating */}
          {movie.rating && (
            <div className="flex items-center gap-1 text-sm mb-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="font-semibold text-foreground">{movie.rating}/10</span>
            </div>
          )}
          
          {/* Title */}
          <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
            {movie.title}
          </h3>
          
          {/* Genres */}
          <div className="flex flex-wrap gap-1">
            {movie.genres?.slice(0, 2).map((genre) => (
              <Badge 
                key={genre} 
                variant="secondary" 
                className="text-xs"
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

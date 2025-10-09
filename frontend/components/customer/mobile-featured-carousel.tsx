"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface FeaturedMovie {
  id: string;
  title: string;
  backdrop_url?: string;
  poster_url?: string;
  tagline?: string;
  genres?: string[];
  rating?: string;
  platform_status?: string;
}

interface FeaturedCarouselProps {
  movies: FeaturedMovie[];
}

export function MobileFeaturedCarousel({ movies }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  console.log("🎬 MobileFeaturedCarousel received movies:", movies);
  console.log("🎬 Movies count:", movies?.length || 0);

  useEffect(() => {
    if (movies.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [movies.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  if (!movies.length) return null;

  const currentMovie = movies[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <div 
        className="relative aspect-[16/9] md:aspect-[21/9] cursor-pointer group"
        onClick={() => router.push(`/movie/${currentMovie.id}`)}
      >
        <Image
          src={currentMovie.backdrop_url || currentMovie.poster_url || "/placeholder-movie.jpg"}
          alt={currentMovie.title}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 pointer-events-none">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-4xl font-bold mb-2 text-foreground">
              {currentMovie.title}
            </h2>
            {currentMovie.tagline && (
              <p className="text-sm md:text-lg text-muted-foreground mb-4">
                {currentMovie.tagline}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {currentMovie.genres?.slice(0, 3).map((genre) => (
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

        {/* Navigation Arrows */}
        {movies.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 transition-all z-10 pointer-events-auto"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 transition-all z-10 pointer-events-auto"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {movies.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {movies.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-primary w-8"
                  : "bg-muted hover:bg-muted-foreground"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

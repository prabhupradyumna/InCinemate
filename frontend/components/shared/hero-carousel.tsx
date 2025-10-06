"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

export type PublicMovie = {
  id: string;
  title: string;
  poster_url?: string;
  backdrop_url?: string;
  genres?: string[];
  duration_minutes?: number;
  release_date?: string;
  rating?: string;
  synopsis?: string;
  platform_status?: string;
};

interface HeroCarouselProps {
  movies: PublicMovie[];
}

export function HeroCarousel({ movies }: HeroCarouselProps) {
  const slides = (movies || [])
    .filter((m) => Boolean(m?.backdrop_url || m?.poster_url))
    .slice(0, 5);

  if (slides.length === 0) return null;

  return (
    <div className="w-full h-[300px] sm:h-[400px] md:h-[500px]">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop
        pagination={{ clickable: true }}
        navigation={true}
        effect="fade"
        className="w-full h-full"
     >
        {slides.map((m) => (
          <SwiperSlide key={m.id}>
            <div className="slide-content w-full h-full">
              <div className="relative w-full h-full">
                <Image
                  src={m.backdrop_url || m.poster_url || '/placeholder-movie.jpg'}
                  alt={m.title}
                  fill
                  priority
                  sizes="100vw"
                  style={{ objectFit: "cover" }}
                />
                {/* Overlay gradient for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="max-w-2xl">
                    <h3 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                      {m.title}
                    </h3>
                    
                    {m.synopsis && (
                      <p className="text-sm md:text-base text-gray-200 mb-3 line-clamp-2 drop-shadow">
                        {m.synopsis}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-300">
                      {m.genres?.length && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {m.genres.slice(0, 3).join(" • ")}
                        </span>
                      )}
                      
                      {m.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {Math.floor(m.duration_minutes / 60)}h {m.duration_minutes % 60}m
                        </span>
                      )}
                      
                      {m.rating && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {m.rating}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <Link href={`/movie/${m.id}`}>
                        <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8">
                          Book Tickets
                        </Button>
                      </Link>
                      <Link href={`/movie/${m.id}`}>
                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                          More Info
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {/* Global styles to customize Swiper UI for dark theme */}
      <style jsx global>{`
        /* Ensure active slide renders on top and controls opacity for fade loop */
        .swiper-slide {
          z-index: 1;
        }
        .swiper-slide-active {
          z-index: 2;
        }
        .swiper-slide .slide-content {
          opacity: 0;
        }
        .swiper-slide-active .slide-content {
          opacity: 1;
        }

        /* Pagination bullets */
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.6);
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background: #ef4444; /* red-500 */
        }

        /* Navigation arrows */
        .swiper-button-prev,
        .swiper-button-next {
          color: #fff;
          width: 40px;
          height: 40px;
          border-radius: 9999px;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: saturate(120%) blur(2px);
        }
        .swiper-button-prev:after,
        .swiper-button-next:after {
          font-size: 18px;
          font-weight: 700;
        }
        .swiper-button-disabled {
          opacity: 0.35 !important;
        }
      `}</style>
    </div>
  );
}

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
  poster_url: string;
  banner_url?: string;
  genres?: string[];
  duration?: string;
  release_date?: string;
  rating?: number;
};

interface HeroCarouselProps {
  movies: PublicMovie[];
}

export function HeroCarousel({ movies }: HeroCarouselProps) {
  const slides = (movies || [])
    .filter((m) => Boolean(m?.banner_url || m?.poster_url))
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
                  src={m.banner_url || m.poster_url}
                  alt={m.title}
                  fill
                  priority
                  sizes="100vw"
                  style={{ objectFit: "cover" }}
                />
                {/* Optional overlay gradient for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/10" />
                <div className="absolute bottom-6 left-6 right-6 text-white drop-shadow-md">
                  <h3 className="text-2xl md:text-3xl font-semibold">{m.title}</h3>
                  {m.genres?.length ? (
                    <p className="mt-1 text-sm md:text-base text-gray-200">
                      {m.genres.join(" • ")}
                    </p>
                  ) : null}
                  <div className="mt-3">
                    <Link href={`/booking/${m.id}`}>
                      <Button size="lg" className="bg-red-600 hover:bg-red-700">
                        Book Tickets
                      </Button>
                    </Link>
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

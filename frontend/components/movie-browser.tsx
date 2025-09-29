"use client"

import { useEffect, useState } from "react"
import { MovieCard } from "@/components/movie-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { HeroCarousel } from "@/components/hero-carousel"

type PublicMovie = {
  id: string
  title: string
  poster_url: string
  genres: string[]
  duration: string
  release_date: string
  rating: number
}

const genres = ["All", "Action", "Comedy", "Drama", "Sci-Fi", "Romance", "Thriller"]

export function MovieBrowser() {
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [allMovies, setAllMovies] = useState<PublicMovie[]>([])

  useEffect(() => {
    fetch("/Movie_data/movies_dummy_dataset.json")
      .then((r) => r.json())
      .then((data: PublicMovie[]) => setAllMovies(data))
      .catch(() => setAllMovies([]))
  }, [])

  const handleGenreFilter = (genre: string) => {
    setSelectedGenre(genre)
  }

  const nowShowing = allMovies.slice(0, 10)
  const comingSoon = allMovies.slice(10, 20)
  const trending = allMovies.slice(20, 30)

  return (
    <div className="space-y-8">
      {/* Hero Carousel */}
      <HeroCarousel movies={allMovies} />

      {/* Now Showing */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-semibold">Now Showing</h2>
          <Link href="#" className="text-sm text-primary hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
          {nowShowing.map((m) => (
            <MovieCard key={m.id} movie={{ id: m.id, title: m.title, posterUrl: m.poster_url }} />
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-semibold">Coming Soon</h2>
          <Link href="#" className="text-sm text-primary hover:underline">View All</Link>
        </div>
        <div className="-mx-4 px-4 overflow-x-auto scrollbar-none">
          <div className="grid grid-flow-col auto-cols-[120px] sm:auto-cols-[140px] md:auto-cols-[180px] gap-3 md:gap-4">
            {comingSoon.map((m) => (
              <MovieCard key={`up-${m.id}`} movie={{ id: m.id, title: m.title, posterUrl: m.poster_url }} />
            ))}
          </div>
        </div>
      </section>

      {/* Trending / Recommended */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-semibold">Trending</h2>
          <Link href="#" className="text-sm text-primary hover:underline">View All</Link>
        </div>
        <div className="-mx-4 px-4 overflow-x-auto scrollbar-none">
          <div className="grid grid-flow-col auto-cols-[120px] sm:auto-cols-[140px] md:auto-cols-[180px] gap-3 md:gap-4">
            {trending.map((m) => (
              <MovieCard key={`tr-${m.id}`} movie={{ id: m.id, title: m.title, posterUrl: m.poster_url }} />
            ))}
          </div>
        </div>
      </section>

      {/* Load More */}
      <div className="text-center pt-8">
        <Button variant="outline" size="lg">
          Load More Movies
        </Button>
      </div>
    </div>
  )
}

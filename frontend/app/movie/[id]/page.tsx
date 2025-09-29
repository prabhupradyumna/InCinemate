"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Play, Star } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export default function MovieDetailPage({ params }: { params: { id: string } }) {
  // Dummy data for UI rendering
  const movie = {
    id: params.id,
    title: "The Dark Knight Returns",
    rating: 8.9,
    genre: ["Action", "Drama"],
    runtime: 165,
    releaseDate: "2024-12-15",
    posterUrl: "/dark-knight-poster.png",
    synopsis:
      "Batman faces his greatest challenge yet in this epic conclusion to the trilogy. Gotham is on the brink and a masked terrorist rises from the shadows.",
    cast: Array.from({ length: 10 }).map((_, i) => ({
      name: `Actor ${i + 1}`,
      role: i % 2 === 0 ? "Lead" : "Supporting",
      photo: "/placeholder-user.jpg",
    })),
    trailer: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <div className="relative w-full h-[420px] md:h-[450px] overflow-hidden rounded-lg">
          <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
          <div className="absolute top-3 right-3">
            <Badge className="bg-black/70 text-white text-xs">
              <Star className="h-3.5 w-3.5 mr-1 inline" /> {movie.rating}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold">{movie.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            {movie.genre.map((g) => (
              <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1"><Clock className="h-4 w-4" /> {movie.runtime}m</div>
            <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {formatDate(movie.releaseDate)}</div>
          </div>

          <p className="text-sm md:text-base text-muted-foreground">{movie.synopsis}</p>

          <div className="flex items-center gap-3">
            <Link href={`/booking/${movie.id}`}>
              <Button className="cinema-glow">Book Tickets</Button>
            </Link>
            <a href={movie.trailer} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary text-sm hover:underline">
              <Play className="h-4 w-4" /> Watch Trailer
            </a>
          </div>
        </div>
      </div>

      {/* Cast & Crew */}
      <section className="space-y-3">
        <h2 className="text-xl md:text-2xl font-semibold">Cast & Crew</h2>
        <div className="-mx-4 px-4 overflow-x-auto">
          <div className="grid grid-flow-col auto-cols-[120px] sm:auto-cols-[140px] gap-4">
            {movie.cast.map((person, idx) => (
              <div key={idx} className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-muted">
                  <Image src={person.photo} alt={person.name} width={96} height={96} className="object-cover w-full h-full" />
                </div>
                <div className="mt-2 text-sm font-medium truncate">{person.name}</div>
                <div className="text-xs text-muted-foreground">{person.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky CTA for mobile */}
      <div className="fixed bottom-0 inset-x-0 p-3 md:hidden bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border">
        <div className="container mx-auto px-0">
          <Link href={`/booking/${movie.id}`}>
            <Button className="w-full cinema-glow">Book Tickets</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}



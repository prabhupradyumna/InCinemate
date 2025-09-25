"use client"

import { useState } from "react"
import { MovieCard } from "@/components/movie-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Mock data - in real app this would come from API
const movies = [
  {
    id: "1",
    title: "The Dark Knight Returns",
    genre: "Action/Drama",
    duration: 165,
    rating: "PG-13",
    releaseDate: "2024-12-15",
    posterUrl: "/dark-knight-poster.png",
    director: "Christopher Nolan",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
    description: "Batman faces his greatest challenge yet in this epic conclusion to the trilogy.",
    showtimes: ["7:00 PM", "10:00 PM"],
    price: "$12.00",
  },
  {
    id: "2",
    title: "Cosmic Journey",
    genre: "Sci-Fi/Adventure",
    duration: 142,
    rating: "PG-13",
    releaseDate: "2024-12-20",
    posterUrl: "/space-adventure-movie-poster.jpg",
    director: "Denis Villeneuve",
    cast: ["Ryan Gosling", "Emma Stone", "Oscar Isaac"],
    description: "A thrilling space adventure that takes audiences to the edge of the universe.",
    showtimes: ["8:00 PM"],
    price: "$14.00",
  },
  {
    id: "3",
    title: "Love in Paris",
    genre: "Romance/Comedy",
    duration: 118,
    rating: "PG",
    releaseDate: "2024-12-25",
    posterUrl: "/romantic-paris-movie-poster.jpg",
    director: "Nancy Meyers",
    cast: ["Anne Hathaway", "Hugh Jackman", "Meryl Streep"],
    description: "A romantic comedy set in the beautiful streets of Paris.",
    showtimes: ["6:30 PM", "9:15 PM"],
    price: "$10.00",
  },
]

const genres = ["All", "Action", "Comedy", "Drama", "Sci-Fi", "Romance", "Thriller"]

export function MovieBrowser() {
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [filteredMovies, setFilteredMovies] = useState(movies)

  const handleGenreFilter = (genre: string) => {
    setSelectedGenre(genre)
    if (genre === "All") {
      setFilteredMovies(movies)
    } else {
      setFilteredMovies(movies.filter((movie) => movie.genre.includes(genre)))
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-balance">Experience Cinema Like Never Before</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
          Book your tickets for the latest blockbusters and indie films at premium theaters near you
        </p>
        <Button size="lg" className="cinema-glow">
          Explore Movies
        </Button>
      </section>

      {/* Filters */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Now Showing</h2>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <Badge
              key={genre}
              variant={selectedGenre === genre ? "default" : "secondary"}
              className={`cursor-pointer transition-colors ${
                selectedGenre === genre ? "bg-primary text-primary-foreground" : "hover:bg-primary/20"
              }`}
              onClick={() => handleGenreFilter(genre)}
            >
              {genre}
            </Badge>
          ))}
        </div>
      </section>

      {/* Movie Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
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

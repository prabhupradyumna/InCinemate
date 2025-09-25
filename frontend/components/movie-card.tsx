import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface Movie {
  id: string
  title: string
  genre: string
  duration: number
  rating: string
  releaseDate: string
  posterUrl: string
  director: string
  cast: string[]
  description: string
  showtimes: string[]
  price: string
}

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Card className="movie-card-hover bg-card border-border overflow-hidden">
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image src={movie.posterUrl || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-black/70 text-white">
            {movie.rating}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-balance leading-tight">{movie.title}</h3>
          <p className="text-sm text-muted-foreground">{movie.genre}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{movie.duration}m</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(movie.releaseDate)}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{movie.description}</p>

        <div className="space-y-2">
          <p className="text-sm font-medium">Showtimes:</p>
          <div className="flex flex-wrap gap-2">
            {movie.showtimes.map((time, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {time}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-lg font-semibold text-primary">{movie.price}</div>
        <Link href={`/booking/${movie.id}`}>
          <Button className="bg-primary hover:bg-primary/90">Book Now</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

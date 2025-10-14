import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatDuration, formatPrice } from "@/lib/utils"

interface MovieCardProps {
  movie: {
    id: string
    title: string
    posterUrl: string
    genres?: string[]
    rating?: string
    duration?: number
  }
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movie/${movie.id}`} className="block">
      <Card className="group bg-card border-border overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 active:scale-95">
        <div className="relative">
          <div className="relative w-full h-[180px] sm:h-[210px] md:h-[270px]">
            <Image
              src={movie.posterUrl || "/placeholder-movie.jpg"}
              alt={movie.title}
              fill
              sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, 180px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              placeholder="empty"
            />
            
            {/* Rating Badge */}
            {movie.rating && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs font-semibold bg-black/70 text-white">
                  {movie.rating}
                </Badge>
              </div>
            )}
            
            {/* Duration Badge */}
            {movie.duration && (
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                  {formatDuration(movie.duration)}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-3 md:p-4">
          <h3 className="font-semibold text-sm sm:text-base md:text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          
          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {movie.genres.slice(0, 2).map((genre, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs px-2 py-0.5"
                >
                  {genre}
                </Badge>
              ))}
              {movie.genres.length > 2 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{movie.genres.length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

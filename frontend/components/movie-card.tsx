import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

interface MovieCardProps {
  movie: {
    id: string
    title: string
    posterUrl: string
  }
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movie/${movie.id}`} className="block">
      <Card className="group bg-card border-border overflow-hidden transition-transform duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95">
        <div className="relative">
          <div className="relative w-full h-[180px] sm:h-[210px] md:h-[270px]">
            <Image
              src={movie.posterUrl || "/placeholder.svg"}
              alt={movie.title}
              fill
              sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, 180px"
              className="object-cover"
              placeholder="empty"
            />
          </div>
        </div>

        <CardContent className="p-3 md:p-4">
          <h3 className="font-semibold text-sm sm:text-base md:text-lg leading-tight truncate">{movie.title}</h3>
        </CardContent>
      </Card>
    </Link>
  )
}

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Filter } from "lucide-react"

export function MovieFilters() {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Button variant="ghost" className="text-sm">
              New York, NY
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Button variant="ghost" className="text-sm">
              Today
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Button variant="ghost" className="text-sm">
              All Theaters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

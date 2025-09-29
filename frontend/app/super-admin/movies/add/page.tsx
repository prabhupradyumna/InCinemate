"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createMovie, listTenants, type CreateMoviePayload } from "@/lib/superadmin"
import { useToast } from "@/hooks/use-toast"
import { ProtectedRoute } from "@/components/auth/protected-route"
import AdminShell from "@/components/layout/AdminShell"

export default function AddMoviePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [tenants, setTenants] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [movie, setMovie] = useState<CreateMoviePayload>({
    title: "",
    poster_url: "",
    trailer_url: "",
    synopsis: "",
    cast: [],
    genre: "",
    duration_minutes: undefined,
    release_date: "",
    rating: "",
    language: "English",
    tenant_id: "",
    is_active: true
  })

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const tenantsData = await listTenants()
        setTenants(tenantsData)
      } catch (error) {
        console.error("Failed to fetch tenants:", error)
        toast({
          title: "Error",
          description: "Failed to load tenants",
          variant: "destructive",
        })
      }
    }
    fetchTenants()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!movie.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }

    if (!movie.tenant_id) {
      toast({
        title: "Error",
        description: "Please select a tenant",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await createMovie(movie)
      toast({
        title: "Success",
        description: "Movie created successfully",
      })
      router.push("/super-admin/movies")
    } catch (error) {
      console.error("Failed to create movie:", error)
      toast({
        title: "Error",
        description: "Failed to create movie",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["super-admin"]}>
      <AdminShell>
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/super-admin/movies">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Movies
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Add New Movie</h1>
              <p className="text-muted-foreground">Create a new movie for the platform</p>
            </div>
          </div>

          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle>Movie Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={movie.title}
                      onChange={(e) => setMovie({ ...movie, title: e.target.value })}
                      placeholder="Enter movie title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      value={movie.language || ""}
                      onChange={(e) => setMovie({ ...movie, language: e.target.value })}
                      placeholder="e.g., English, Hindi"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenant_id">Tenant *</Label>
                  <Select
                    value={movie.tenant_id}
                    onValueChange={(value) => setMovie({ ...movie, tenant_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.tenant_id} value={tenant.tenant_id}>
                          {tenant.name} ({tenant.tenant_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={movie.is_active}
                    onCheckedChange={(checked) => setMovie({ ...movie, is_active: checked as boolean })}
                  />
                  <Label htmlFor="is_active" className="text-sm font-medium">
                    Active Movie
                  </Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="poster_url">Poster URL</Label>
                    <Input
                      id="poster_url"
                      value={movie.poster_url || ""}
                      onChange={(e) => setMovie({ ...movie, poster_url: e.target.value })}
                      placeholder="https://example.com/poster.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trailer_url">Trailer URL</Label>
                    <Input
                      id="trailer_url"
                      value={movie.trailer_url || ""}
                      onChange={(e) => setMovie({ ...movie, trailer_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="synopsis">Synopsis</Label>
                  <Textarea
                    id="synopsis"
                    value={movie.synopsis || ""}
                    onChange={(e) => setMovie({ ...movie, synopsis: e.target.value })}
                    placeholder="Brief description of the movie"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cast">Cast</Label>
                  <Input
                    id="cast"
                    value={Array.isArray(movie.cast) ? movie.cast.join(", ") : ""}
                    onChange={(e) => setMovie({ ...movie, cast: e.target.value.split(",").map(s => s.trim()).filter(s => s) })}
                    placeholder="Actor 1, Actor 2, Actor 3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Input
                      id="genre"
                      value={movie.genre || ""}
                      onChange={(e) => setMovie({ ...movie, genre: e.target.value })}
                      placeholder="e.g., Action, Drama, Comedy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                      id="rating"
                      value={movie.rating || ""}
                      onChange={(e) => setMovie({ ...movie, rating: e.target.value })}
                      placeholder="e.g., PG-13, R, G"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                    <Input
                      id="duration_minutes"
                      type="number"
                      value={movie.duration_minutes || ""}
                      onChange={(e) => setMovie({ ...movie, duration_minutes: parseInt(e.target.value) || undefined })}
                      placeholder="120"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="release_date">Release Date</Label>
                    <Input
                      id="release_date"
                      type="date"
                      value={movie.release_date || ""}
                      onChange={(e) => setMovie({ ...movie, release_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white">
                    {isSubmitting ? "Creating..." : "Create Movie"}
                  </Button>
                  <Link href="/super-admin/movies">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </AdminShell>
    </ProtectedRoute>
  )
}
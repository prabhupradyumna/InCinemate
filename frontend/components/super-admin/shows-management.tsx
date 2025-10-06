"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, Clock, Plus, Trash2, Edit, Film, MapPin, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { listTenants, getMoviesByTenant, getTheatresByTenant, getAuditoriumsByTheatre, createShow, listShows, deleteShow } from "@/lib/superadmin"

interface Show {
  id: string
  movie_id: string
  auditorium_id: string
  show_datetime: string
  status: string
  pricing: any
  tenant_id: string
  Movie?: {
    title: string
    poster_url: string
  }
  Auditorium?: {
    name: string
    Theatre?: {
      name: string
    }
  }
}

export function ShowsManagement() {
  const { toast } = useToast()
  const [shows, setShows] = useState<Show[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [movies, setMovies] = useState<any[]>([])
  const [theatres, setTheatres] = useState<any[]>([])
  const [auditoriums, setAuditoriums] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form state
  const [selectedTenant, setSelectedTenant] = useState("")
  const [selectedMovie, setSelectedMovie] = useState("")
  const [selectedTheatre, setSelectedTheatre] = useState("")
  const [selectedAuditorium, setSelectedAuditorium] = useState("")
  const [showDate, setShowDate] = useState("")
  const [showTime, setShowTime] = useState("")
  const [status, setStatus] = useState("scheduled")
  const [premiumPrice, setPremiumPrice] = useState("18")
  const [regularPrice, setRegularPrice] = useState("12")

  // Load tenants on mount
  useEffect(() => {
    loadTenants()
    loadShows()
  }, [])

  // Load movies when tenant changes
  useEffect(() => {
    if (selectedTenant) {
      loadMovies(selectedTenant)
      loadTheatres(selectedTenant)
    }
  }, [selectedTenant])

  // Load auditoriums when theatre changes
  useEffect(() => {
    if (selectedTheatre) {
      loadAuditoriums(selectedTheatre)
    }
  }, [selectedTheatre])

  const loadTenants = async () => {
    try {
      const data = await listTenants()
      setTenants(data || [])
    } catch (error) {
      console.error("Failed to load tenants:", error)
    }
  }

  const loadMovies = async (tenantId: string) => {
    try {
      // Find the selected tenant to get the tenant_id string for API calls
      const selectedTenantData = tenants.find(t => t.id === tenantId);
      const actualTenantId = selectedTenantData?.tenant_id || tenantId;

      console.log('🎬 Loading movies for tenant:', {
        selectedTenantId: tenantId,
        actualTenantId: actualTenantId,
        selectedTenantData
      });

      const data = await getMoviesByTenant(actualTenantId);
      setMovies(data || []);
    } catch (error) {
      console.error("Failed to load movies:", error);
    }
  }

  const loadTheatres = async (tenantId: string) => {
    try {
      // Find the selected tenant to get the tenant_id string for API calls
      const selectedTenantData = tenants.find(t => t.id === tenantId);
      const actualTenantId = selectedTenantData?.tenant_id || tenantId;

      console.log('🏢 Loading theatres for tenant:', {
        selectedTenantId: tenantId,
        actualTenantId: actualTenantId,
        selectedTenantData
      });

      const data = await getTheatresByTenant(actualTenantId);
      setTheatres(data || []);
    } catch (error) {
      console.error("Failed to load theatres:", error);
    }
  }

  const loadAuditoriums = async (theatreId: string) => {
    try {
      const data = await getAuditoriumsByTheatre(theatreId)
      setAuditoriums(data || [])
    } catch (error) {
      console.error("Failed to load auditoriums:", error)
    }
  }

  const loadShows = async () => {
    try {
      setLoading(true)
      const data = await listShows()
      setShows(data || [])
    } catch (error) {
      console.error("Failed to load shows:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateShow = async () => {
    if (!selectedTenant || !selectedMovie || !selectedAuditorium || !showDate || !showTime) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const showDatetime = `${showDate}T${showTime}:00`

      // Find the selected tenant to get the database ID (UUID) for backend lookup
      const selectedTenantData = tenants.find(t => t.id === selectedTenant);
      const tenantDbId = selectedTenantData?.id || selectedTenant;

      console.log('🎭 Creating show with tenant:', {
        selectedTenantId: selectedTenant,
        tenantDbId: tenantDbId,
        selectedTenantData
      });

      await createShow({
        tenant_id: tenantDbId, // Send the tenant database ID (UUID) for backend lookup
        movie_id: selectedMovie,
        auditorium_id: selectedAuditorium,
        show_datetime: showDatetime,
        status,
        pricing: {
          premium: parseFloat(premiumPrice),
          regular: parseFloat(regularPrice),
        },
      })

      toast({
        title: "Success",
        description: "Show created successfully",
      })

      // Reset form
      setSelectedMovie("")
      setSelectedTheatre("")
      setSelectedAuditorium("")
      setShowDate("")
      setShowTime("")
      setPremiumPrice("18")
      setRegularPrice("12")
      setIsDialogOpen(false)

      // Reload shows
      loadShows()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.error || "Failed to create show",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteShow = async (showId: string) => {
    if (!confirm("Are you sure you want to delete this show?")) return

    try {
      setDeletingId(showId)
      await deleteShow(showId)
      toast({
        title: "Success",
        description: "Show deleted successfully",
      })
      // Refresh shows list
      loadShows()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.error || "Failed to delete show",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Shows Management</h2>
          <p className="text-muted-foreground">Create and manage movie shows across all venues</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Show
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Show</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Tenant Selection */}
              <div className="space-y-2">
                <Label htmlFor="tenant">Select Tenant/Client *</Label>
                <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Movie Selection */}
              <div className="space-y-2">
                <Label htmlFor="movie">Select Movie *</Label>
                <Select value={selectedMovie} onValueChange={setSelectedMovie} disabled={!selectedTenant || movies.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !selectedTenant
                        ? "Choose a tenant first"
                        : movies.length === 0
                          ? "No movies available for this tenant"
                          : "Choose a movie"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {movies.map((movie) => (
                      <SelectItem key={movie.id} value={movie.id}>
                        {movie.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTenant && movies.length === 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      No movies found for this tenant. Please create movies first in Movie Management.
                    </p>
                    <Link href="/super-admin/movies/add">
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Create Movie for this Tenant
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Theatre Selection */}
              <div className="space-y-2">
                <Label htmlFor="theatre">Select Theatre *</Label>
                <Select value={selectedTheatre} onValueChange={setSelectedTheatre} disabled={!selectedTenant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a theatre" />
                  </SelectTrigger>
                  <SelectContent>
                    {theatres.map((theatre) => (
                      <SelectItem key={theatre.id} value={theatre.id}>
                        {theatre.name} - {theatre.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Auditorium Selection */}
              <div className="space-y-2">
                <Label htmlFor="auditorium">Select Auditorium *</Label>
                <Select value={selectedAuditorium} onValueChange={setSelectedAuditorium} disabled={!selectedTheatre}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an auditorium" />
                  </SelectTrigger>
                  <SelectContent>
                    {auditoriums.map((auditorium) => (
                      <SelectItem key={auditorium.id} value={auditorium.id}>
                        {auditorium.name} ({auditorium.total_seats} seats)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Show Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={showDate}
                    onChange={(e) => setShowDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Show Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={showTime}
                    onChange={(e) => setShowTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="premium">Premium Price ($)</Label>
                  <Input
                    id="premium"
                    type="number"
                    value={premiumPrice}
                    onChange={(e) => setPremiumPrice(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regular">Regular Price ($)</Label>
                  <Input
                    id="regular"
                    type="number"
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleCreateShow} className="w-full">
                Create Show
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Shows Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Shows</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading shows...</div>
          ) : shows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No shows created yet. Create your first show to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Movie</TableHead>
                  <TableHead>Theatre</TableHead>
                  <TableHead>Auditorium</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shows.map((show) => (
                  <TableRow key={show.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Film className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{show.Movie?.title || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{show.Auditorium?.Theatre?.name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{show.Auditorium?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDateTime(show.show_datetime)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Premium: ${show.pricing?.premium || 0}</div>
                        <div>Regular: ${show.pricing?.regular || 0}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          show.status === 'scheduled'
                            ? 'default'
                            : show.status === 'live'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {show.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteShow(show.id)}
                        disabled={deletingId === show.id}
                      >
                        {deletingId === show.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive"></div>
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

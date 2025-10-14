"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/customer/protected-route";
import AdminShell from "@/components/layout/AdminShell";
import Link from "next/link";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieDTO } from "@/lib/superadmin";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign,
  Play,
  ExternalLink,
  Award,
  Camera,
  Music,
  MapPin
} from "lucide-react";

export default function MovieDetailsPage() {
  const params = useParams();
  const { toast } = useToast();
  const [movie, setMovie] = useState<MovieDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`/api/superadmin/movies/${params.id}?include_relations=true`);
        if (response.ok) {
          const data = await response.json();
          setMovie(data.data);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch movie details",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching movie:", error);
        toast({
          title: "Error",
          description: "Failed to fetch movie details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMovie();
    }
  }, [params.id, toast]);

  const handleDeleteMovie = async () => {
    if (!movie) return;
    
    if (!confirm("Are you sure you want to delete this movie? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/superadmin/movies/${movie.id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Movie deleted successfully"
        });
        window.location.href = "/super-admin/movies";
      } else {
        toast({
          title: "Error",
          description: "Failed to delete movie",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting movie:", error);
      toast({
        title: "Error",
        description: "Failed to delete movie",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["super-admin"]}>
        <AdminShell>
          <div className="min-h-screen bg-background">
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center px-8">
                <Link href="/super-admin/movies">
                  <Button variant="ghost" size="sm" className="mr-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Movies
                  </Button>
                </Link>
                <div className="flex flex-1 items-center space-x-2">
                  <h1 className="text-xl font-semibold">Movie Details</h1>
                </div>
              </div>
            </div>
            
            <div className="container px-8 py-8">
              <div className="mx-auto max-w-6xl">
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading movie details...</p>
                </div>
              </div>
            </div>
          </div>
        </AdminShell>
      </ProtectedRoute>
    );
  }

  if (!movie) {
    return (
      <ProtectedRoute allowedRoles={["super-admin"]}>
        <AdminShell>
          <div className="min-h-screen bg-background">
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center px-8">
                <Link href="/super-admin/movies">
                  <Button variant="ghost" size="sm" className="mr-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Movies
                  </Button>
                </Link>
                <div className="flex flex-1 items-center space-x-2">
                  <h1 className="text-xl font-semibold">Movie Details</h1>
                </div>
              </div>
            </div>
            
            <div className="container px-8 py-8">
              <div className="mx-auto max-w-6xl">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Movie not found</p>
                </div>
              </div>
            </div>
          </div>
        </AdminShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["super-admin"]}>
      <AdminShell>
        <div className="min-h-screen bg-background">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center px-8">
              <Link href="/super-admin/movies">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Movies
                </Button>
              </Link>
              <div className="flex flex-1 items-center justify-between">
                <h1 className="text-xl font-semibold">{movie.title}</h1>
                <div className="flex items-center gap-2">
                  <Link href={`/super-admin/movies/${movie.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Movie
                    </Button>
                  </Link>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDeleteMovie}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Movie
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="container px-8 py-8">
            <div className="mx-auto max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Movie Poster */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardContent className="p-0">
                      <div className="aspect-[2/3] relative overflow-hidden rounded-lg">
                        {movie.poster_url ? (
                          <img 
                            src={movie.poster_url} 
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-4xl font-bold text-muted-foreground">
                              {movie.title?.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-sm">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">
                          {movie.average_user_rating?.toFixed(1) || "N/A"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({movie.total_ratings || 0} ratings)
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">
                          {movie.total_bookings || 0} bookings
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          {movie.duration_minutes || 0} minutes
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {movie.release_date ? new Date(movie.release_date).toLocaleDateString() : "TBD"}
                        </span>
                      </div>

                      {movie.budget && movie.budget > 0 && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-sm">
                            {new Intl.NumberFormat('en-IN', {
                              style: 'currency',
                              currency: 'INR',
                              minimumFractionDigits: 0
                            }).format(movie.budget)}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Status and Features */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-sm">Status & Features</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {movie.is_active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      {movie.is_featured && <Badge variant="secondary">Featured</Badge>}
                      {movie.is_trending && <Badge className="bg-orange-500">Trending</Badge>}
                      {movie.cbfc_certificate && (
                        <Badge variant="outline">{movie.cbfc_certificate}</Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        About the Movie
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {movie.tagline && (
                        <p className="text-sm font-medium text-muted-foreground italic">
                          "{movie.tagline}"
                        </p>
                      )}

                      {movie.short_description && (
                        <p className="text-sm font-medium text-muted-foreground">
                          {movie.short_description}
                        </p>
                      )}
                      
                      {movie.synopsis && (
                        <div>
                          <h4 className="font-medium mb-2">Synopsis</h4>
                          <p className="text-sm text-muted-foreground">
                            {movie.synopsis}
                          </p>
                        </div>
                      )}

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Genres</h4>
                          <div className="flex flex-wrap gap-1">
                            {movie.genres?.map((genre, index) => (
                              <Badge key={index} variant="secondary">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Languages</h4>
                          <div className="flex flex-wrap gap-1">
                            {movie.languages?.map((language, index) => (
                              <Badge key={index} variant="outline">
                                {language}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Formats</h4>
                          <div className="flex flex-wrap gap-1">
                            {movie.formats?.map((format, index) => (
                              <Badge key={index} variant="outline">
                                {format}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {movie.keywords && movie.keywords.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Keywords</h4>
                            <div className="flex flex-wrap gap-1">
                              {movie.keywords.slice(0, 6).map((keyword, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {movie.trailer_url && (
                        <div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(movie.trailer_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Watch Trailer
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Production Information */}
                  {(movie.production_houses?.length || movie.distributors?.length) && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>Production Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {movie.production_houses && movie.production_houses.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Production Houses</h4>
                            <div className="space-y-1">
                              {movie.production_houses.map((house, index) => (
                                <p key={index} className="text-sm text-muted-foreground">
                                  {house}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {movie.distributors && movie.distributors.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Distributors</h4>
                            <div className="space-y-1">
                              {movie.distributors.map((distributor, index) => (
                                <p key={index} className="text-sm text-muted-foreground">
                                  {distributor}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminShell>
    </ProtectedRoute>
  );
}
"use client";

import { useState } from "react";
import { MovieDTO } from "@/lib/superadmin";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  DollarSign,
  Play,
  ExternalLink,
  Award,
  Camera,
  Music,
  MapPin
} from "lucide-react";

interface MovieDetailsDialogProps {
  movie: MovieDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovieDetailsDialog({ movie, open, onOpenChange }: MovieDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (movie: MovieDTO) => {
    if (!movie.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    switch (movie.platform_status) {
      case "coming_soon":
        return <Badge variant="outline">Coming Soon</Badge>;
      case "advance_booking":
        return <Badge variant="default">Advance Booking</Badge>;
      case "now_showing":
        return <Badge variant="default">Now Showing</Badge>;
      case "running_successfully":
        return <Badge className="bg-green-500">Running Successfully</Badge>;
      case "closing_soon":
        return <Badge variant="destructive">Closing Soon</Badge>;
      case "ended":
        return <Badge variant="secondary">Ended</Badge>;
      default:
        return <Badge variant="default">Active</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-8 rounded">
              <AvatarImage src={movie.poster_url} alt={movie.title} />
              <AvatarFallback className="rounded text-xs">
                {movie.title?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-bold">{movie.title}</div>
              {movie.tagline && (
                <div className="text-sm text-muted-foreground font-normal">
                  {movie.tagline}
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

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
                    {movie.release_date ? formatDate(movie.release_date) : "TBD"}
                  </span>
                </div>

                {movie.budget && movie.budget > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">
                      {formatCurrency(movie.budget)}
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
                {getStatusBadge(movie)}
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
                <TabsTrigger value="production">Production</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      About the Movie
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
              </TabsContent>

              {/* Cast & Crew Tab */}
              <TabsContent value="cast" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Cast
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {movie.cast && movie.cast.length > 0 ? (
                        <div className="space-y-3">
                          {movie.cast.slice(0, 10).map((castMember, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={castMember.actor?.profile_image_url} />
                                <AvatarFallback className="text-xs">
                                  {castMember.actor?.name?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">
                                  {castMember.actor?.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {castMember.character_name}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No cast information available
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Crew
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {movie.crew && movie.crew.length > 0 ? (
                        <div className="space-y-3">
                          {movie.crew.slice(0, 10).map((crewMember, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={crewMember.person?.profile_image_url} />
                                <AvatarFallback className="text-xs">
                                  {crewMember.person?.name?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">
                                  {crewMember.person?.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {crewMember.role_title}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No crew information available
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Production Tab */}
              <TabsContent value="production" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
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

                      {movie.budget && movie.budget > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Budget</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(movie.budget)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pricing Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {movie.suggested_base_price_min && movie.suggested_base_price_max && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Price Range</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(movie.suggested_base_price_min)} - {formatCurrency(movie.suggested_base_price_max)}
                          </p>
                        </div>
                      )}

                      {movie.premium_multiplier && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Premium Multiplier</h4>
                          <p className="text-sm text-muted-foreground">
                            {movie.premium_multiplier}x
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-2xl font-bold">
                            {movie.total_bookings || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Total Bookings
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <div>
                          <p className="text-2xl font-bold">
                            {movie.average_user_rating?.toFixed(1) || "0.0"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            User Rating
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-2xl font-bold">
                            {movie.total_ratings || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Total Ratings
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-purple-500" />
                        <div>
                          {/* <p className="text-2xl font-bold">
                            {movie.approval_status === 'published' ? '✓' : '•'}
                          </p> */}
                          <p className="text-xs text-muted-foreground">
                            Status
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* SEO Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>SEO & Marketing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {movie.meta_title && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Meta Title</h4>
                        <p className="text-sm text-muted-foreground">
                          {movie.meta_title}
                        </p>
                      </div>
                    )}

                    {movie.meta_description && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Meta Description</h4>
                        <p className="text-sm text-muted-foreground">
                          {movie.meta_description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Eye,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Film
} from "lucide-react";

import { listMovies, updateMovie, deleteMovie, type MovieDTO } from "@/lib/superadmin";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/customer/auth-provider";
import { useSearchParams } from "next/navigation";

function MovieListTableContent() {
  const [movies, setMovies] = useState<MovieDTO[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<MovieDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMovies, setSelectedMovies] = useState(new Set<string>());
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewingMovie, setPreviewingMovie] = useState<MovieDTO | null>(null);
  
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const searchParams = useSearchParams();
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch movies
  const fetchMovies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to view movies",
          variant: "destructive",
        });
        return;
      }
      
      const response = await listMovies();
      setMovies(response.data || []);
    } catch (error: any) {
      console.error("Failed to fetch movies:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch movies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      fetchMovies();
    }
  }, [isLoading]);

  // Filter movies
  useEffect(() => {
    let filtered = movies;

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(movie =>
        movie.title?.toLowerCase().includes(query) ||
        movie.synopsis?.toLowerCase().includes(query) ||
        movie.genres?.some(genre => genre.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(movie => {
        if (statusFilter === "active") return movie.is_active;
        if (statusFilter === "inactive") return !movie.is_active;
        return true;
      });
    }

    setFilteredMovies(filtered);
  }, [movies, debouncedSearchQuery, statusFilter]);

  // Helper function to construct image URLs
  const getImageUrl = (imageUrl: string | null | undefined) => {
    if (!imageUrl) return undefined;
    if (imageUrl.startsWith('http')) return imageUrl;
    
    // Use relative path since Next.js rewrite will handle /uploads
    return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  };

  // Helper to format platform status nicely
  const formatPlatformStatus = (status?: string) => {
    switch (status) {
      case 'coming_soon':
        return 'Coming Soon';
      case 'advance_booking':
        return 'Advance Booking';
      case 'now_showing':
        return 'Now Showing';
      case 'running_successfully':
        return 'Running Successfully';
      case 'closing_soon':
        return 'Closing Soon';
      case 'ended':
        return 'Ended';
      default:
        return '—';
    }
  };

  // Handle bulk operations
  const handleBulkStatusUpdate = async (status: boolean) => {
    if (selectedMovies.size === 0) return;

    const action = status ? 'activate' : 'deactivate';
    if (!confirm(`Are you sure you want to ${action} ${selectedMovies.size} movie(s)?`)) {
      return;
    }

    try {
      const promises = Array.from(selectedMovies).map(movieId =>
        updateMovie(movieId, { is_active: status })
      );
      
      await Promise.all(promises);
      
      toast({
        title: "Success",
        description: `Successfully ${action}d ${selectedMovies.size} movie(s)`,
      });
      
      setSelectedMovies(new Set());
      fetchMovies();
    } catch (error) {
      console.error(`Failed to ${action} movies:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} movies`,
        variant: "destructive",
      });
    }
  };

  // Handle delete movie
  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;

    try {
      await deleteMovie(movieId);
      toast({
        title: "Success",
        description: "Movie deleted successfully",
      });
      fetchMovies();
    } catch (error) {
      console.error("Failed to delete movie:", error);
      toast({
        title: "Error",
        description: "Failed to delete movie",
        variant: "destructive",
      });
    }
  };

  // Handle preview
  const handlePreview = (movie: MovieDTO) => {
    setPreviewingMovie(movie);
    setIsPreviewDialogOpen(true);
  };

  // Handle checkbox changes
  const handleSelectMovie = (movieId: string, checked: boolean) => {
    const newSelected = new Set(selectedMovies);
    if (checked) {
      newSelected.add(movieId);
    } else {
      newSelected.delete(movieId);
    }
    setSelectedMovies(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMovies(new Set(filteredMovies.map(movie => movie.id)));
    } else {
      setSelectedMovies(new Set());
    }
  };

  const allSelected = filteredMovies.length > 0 && selectedMovies.size === filteredMovies.length;
  const someSelected = selectedMovies.size > 0 && selectedMovies.size < filteredMovies.length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading movies...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Movies Management</h1>
            <p className="text-muted-foreground">
              Manage your movie catalog ({filteredMovies.length} movies)
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button asChild size="lg">
              <Link href="/super-admin/movies/add">
                <Plus className="mr-2 h-4 w-4" />
                Add New Movie
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Film className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Movies</p>
                  <p className="text-2xl font-bold">{movies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Movies</p>
                  <p className="text-2xl font-bold">{movies.filter(m => m.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inactive Movies</p>
                  <p className="text-2xl font-bold">{movies.filter(m => !m.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Filter className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Filtered Results</p>
                  <p className="text-2xl font-bold">{filteredMovies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search movies by title, genres..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📋 All Movies</SelectItem>
                  <SelectItem value="active">✅ Active Only</SelectItem>
                  <SelectItem value="inactive">❌ Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Bulk Actions */}
            {selectedMovies.size > 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium">
                  {selectedMovies.size} movie(s) selected
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleBulkStatusUpdate(true)}
                    className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Activate Selected
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleBulkStatusUpdate(false)}
                    className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Deactivate Selected
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Movies Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    ref={(el) => {
                      if (el) (el as any).indeterminate = someSelected;
                    }}
                  />
                </TableHead>
                <TableHead className="w-20">🎬 Poster</TableHead>
                <TableHead className="font-semibold">📽️ Movie Title</TableHead>
                <TableHead className="font-semibold">⭐ Rating</TableHead>
                <TableHead className="font-semibold">🎭 Genres</TableHead>
                <TableHead className="font-semibold">⏱️ Duration</TableHead>
                <TableHead className="font-semibold">📊 Platform Status</TableHead>
                <TableHead className="font-semibold text-center w-32">🔧 Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {debouncedSearchQuery.trim() || statusFilter !== "all" 
                        ? "No movies found matching your criteria" 
                        : "No movies found"}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMovies.map((movie) => (
                  <TableRow key={movie.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedMovies.has(movie.id)}
                        onCheckedChange={(checked) => handleSelectMovie(movie.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <Avatar className="h-12 w-8 rounded">
                        <AvatarImage 
                          src={getImageUrl(movie.poster_url)} 
                          alt={movie.title} 
                        />
                        <AvatarFallback className="rounded text-xs">
                          {movie.title?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{movie.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {movie.release_date}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{movie.rating}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {movie.genres?.slice(0, 2).map((genre, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                        {movie.genres && movie.genres.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{movie.genres.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{movie.duration_minutes} min</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {formatPlatformStatus(movie.platform_status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(movie)}
                          className="h-8 px-2"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-8 px-2"
                        >
                          <Link href={`/super-admin/movies/add?edit=${movie.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMovie(movie.id)}
                          className="h-8 px-2 text-destructive hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          {previewingMovie && (
            <>
              <DialogHeader>
                <DialogTitle>{previewingMovie.title}</DialogTitle>
                <DialogDescription>Movie Details Preview</DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Poster */}
                <div className="space-y-2">
                  <Label>Poster</Label>
                  <div className="relative aspect-[2/3] w-full max-w-[200px]">
                    <Image
                      src={getImageUrl(previewingMovie.poster_url) || "/placeholder.jpg"}
                      alt={previewingMovie.title}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                </div>

                {/* Movie Details */}
                <div className="col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Languages</Label>
                      <p className="text-sm">{previewingMovie.languages?.join(", ")}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Duration</Label>
                      <p className="text-sm">{previewingMovie.duration_minutes} minutes</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Release Date</Label>
                      <p className="text-sm">{previewingMovie.release_date}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Rating</Label>
                      <p className="text-sm">{previewingMovie.rating}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Synopsis</Label>
                    <p className="text-sm">{previewingMovie.synopsis}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Genres</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {previewingMovie.genres?.map((genre, index) => (
                        <Badge key={index} variant="secondary">{genre}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Backdrop Image */}
              {previewingMovie.backdrop_url && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Backdrop Image</Label>
                  <div className="relative aspect-video w-full max-w-[400px]">
                    <Image
                      src={getImageUrl(previewingMovie.backdrop_url) || "/placeholder.jpg"}
                      alt={`${previewingMovie.title} backdrop`}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
                  Close
                </Button>
                <Button asChild>
                  <Link href={`/super-admin/movies/add?edit=${previewingMovie?.id}`}>
                    Edit Movie
                  </Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MovieListTable() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MovieListTableContent />
    </Suspense>
  );
}
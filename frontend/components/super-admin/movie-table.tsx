"use client";
import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Search, Eye, Check, X } from "lucide-react";
import { listMovies, updateMovie, deleteMovie, listTenants, type MovieDTO } from "@/lib/superadmin";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/customer/auth-provider";
import { useRouter } from "next/navigation";

export const MovieTable = forwardRef<{ refresh: () => void }, { statusFilter?: 'all' | 'active' | 'inactive' }>(
  function MovieTable({ statusFilter = 'all' }, ref) {
    const [movies, setMovies] = useState<MovieDTO[]>([]);
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingMovie, setEditingMovie] = useState<MovieDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewingMovie, setPreviewingMovie] = useState<MovieDTO | null>(null);
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const router = useRouter();    const fetchMovies = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        const token = localStorage.getItem('accessToken');
        if (!token) {
          toast({
            title: "Authentication Required",
            description: "Please login to view movies",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        const response = await listMovies();
        setMovies(response.data || []);
      } catch (error: any) {
        console.error("Failed to fetch movies:", error);
        
        if (error.response?.status === 401 || error.message?.includes('token')) {
          toast({
            title: "Authentication Error",
            description: "Please login again to access movies",
            variant: "destructive",
          });
        } else {
          const errorMessage = error instanceof Error ? error.message : "Failed to load movies";
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      refresh: fetchMovies,
    }));

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const tenantsData = await listTenants();
      setTenants(tenantsData || []);
    } catch (error: any) {
      console.error("Failed to fetch tenants:", error);
      
      if (!(error.response?.status === 401 || error.message?.includes('token'))) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load tenants";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      fetchMovies();
      fetchTenants();
    } else {
      setLoading(false);
    }
  }, [user, isLoading]);

  const handleUpdateMovie = async () => {
    if (!editingMovie) return;

    setIsSubmitting(true);
    try {
      await updateMovie(editingMovie.id, editingMovie);
      toast({
        title: "Success",
        description: "Movie updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingMovie(null);
      fetchMovies();
    } catch (error) {
      console.error("Failed to update movie:", error);
      toast({
        title: "Error",
        description: "Failed to update movie",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;

    try {
      await deleteMovie(id);
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

  const handleEditMovie = (movieId: string) => {
    router.push(`/super-admin/movies/add?edit=${movieId}`);
  };

  const handlePreviewMovie = (movie: MovieDTO) => {
    setPreviewingMovie(movie);
    setIsPreviewDialogOpen(true);
  };

  const toggleMovieSelection = (movieId: string) => {
    setSelectedMovies(prev => 
      prev.includes(movieId) 
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMovies.length === filteredMovies.length) {
      setSelectedMovies([]);
    } else {
      setSelectedMovies(filteredMovies.map(movie => movie.id));
    }
  };

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedMovies.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select movies to update",
        variant: "destructive",
      });
      return;
    }

    const action = isActive ? "activate" : "deactivate";
    if (!confirm(`Are you sure you want to ${action} ${selectedMovies.length} selected movie(s)?`)) return;

    try {
      const updatePromises = selectedMovies.map(movieId => {
        // Only send the specific field we want to update
        return updateMovie(movieId, { is_active: isActive });
      });

      await Promise.all(updatePromises.filter(Boolean));
      
      toast({
        title: "Success",
        description: `${selectedMovies.length} movie(s) ${action}d successfully`,
      });
      
      setSelectedMovies([]);
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

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && movie.is_active) ||
      (statusFilter === 'inactive' && !movie.is_active);
    return matchesSearch && matchesStatus;
  });

  if (isLoading || loading) {
    return <div className="text-center py-8">Loading movies...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please login to view movies</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        {selectedMovies.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedMovies.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatusUpdate(true)}
              className="text-green-600 hover:text-green-700"
              title="Activate selected movies"
            >
              <Check className="h-4 w-4 mr-1" />
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatusUpdate(false)}
              className="text-orange-600 hover:text-orange-700"
              title="Deactivate selected movies"
            >
              <X className="h-4 w-4 mr-1" />
              Deactivate
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left w-12">
                <Checkbox
                  checked={filteredMovies.length > 0 && selectedMovies.length === filteredMovies.length}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all movies"
                  title="Select all movies"
                />
              </th>
              <th className="px-4 py-2 text-left">Movie</th>
              <th className="px-4 py-2 text-left">Genre</th>
              <th className="px-4 py-2 text-left">Duration</th>
              <th className="px-4 py-2 text-left">Rating</th>
              <th className="px-4 py-2 text-left">Release Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovies.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  {movies.length === 0 ? "No movies found. Create your first movie!" : "No movies match your search criteria."}
                </td>
              </tr>
            ) : (
              filteredMovies.map((movie) => (
              <tr key={movie.id} className="border-b">
                <td className="px-4 py-2">
                  <Checkbox
                    checked={selectedMovies.includes(movie.id)}
                    onCheckedChange={() => toggleMovieSelection(movie.id)}
                    aria-label={`Select ${movie.title}`}
                    title={`Select ${movie.title}`}
                  />
                </td>
                <td className="px-4 py-2 flex items-center gap-2">
                  <Image
                    src={movie.poster_url || "/placeholder.jpg"}
                    alt={movie.title}
                    width={50}
                    height={75}
                    className="rounded object-cover"
                  />
                  <div>
                    <div className="font-medium">{movie.title}</div>
                    <div className="text-sm text-gray-500">
                      {movie.languages?.join(', ') || 'No language specified'}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2">
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {movie.genres.slice(0, 2).map((genre, index) => (
                        <span key={index} className="inline-block bg-gray-200 rounded px-2 py-1 text-xs">
                          {genre}
                        </span>
                      ))}
                      {movie.genres.length > 2 && (
                        <span className="inline-block bg-gray-100 rounded px-2 py-1 text-xs">
                          +{movie.genres.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">{movie.duration_minutes ? `${movie.duration_minutes} min` : '-'}</td>
                <td className="px-4 py-2">{movie.rating || '-'}</td>
                <td className="px-4 py-2">
                  {movie.release_date ? new Date(movie.release_date).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-2">
                  {movie.is_active ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreviewMovie(movie)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="Preview movie"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditMovie(movie.id)}
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                      title="Edit movie"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMovie(movie.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete movie"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Movie</DialogTitle>
          </DialogHeader>
          {editingMovie && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={editingMovie.title}
                    onChange={(e) => setEditingMovie({ ...editingMovie, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-languages">Languages</Label>
                  <Input
                    id="edit-languages"
                    value={editingMovie.languages?.join(", ") || ""}
                    onChange={(e) => setEditingMovie({ 
                      ...editingMovie, 
                      languages: e.target.value.split(",").map(s => s.trim()).filter(s => s) 
                    })}
                    placeholder="English, Hindi, Tamil"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tenant_id">Tenant *</Label>
                <Select
                  value={editingMovie.tenant_id}
                  onValueChange={(value) => setEditingMovie({ ...editingMovie, tenant_id: value })}
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

              <div className="space-y-2">
                <Label htmlFor="edit-poster_url">Poster URL</Label>
                <Input
                  id="edit-poster_url"
                  value={editingMovie.poster_url || ""}
                  onChange={(e) => setEditingMovie({ ...editingMovie, poster_url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-trailer_url">Trailer URL</Label>
                <Input
                  id="edit-trailer_url"
                  value={editingMovie.trailer_url || ""}
                  onChange={(e) => setEditingMovie({ ...editingMovie, trailer_url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-synopsis">Synopsis</Label>
                <Textarea
                  id="edit-synopsis"
                  value={editingMovie.synopsis || ""}
                  onChange={(e) => setEditingMovie({ ...editingMovie, synopsis: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-cast">Cast (Read Only)</Label>
                <Input
                  id="edit-cast"
                  value={editingMovie.cast?.map(c => c.actor?.name || 'Unknown').join(", ") || "No cast information"}
                  disabled
                  placeholder="Use the full movie form to edit cast details"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-genres">Genres</Label>
                  <Input
                    id="edit-genres"
                    value={editingMovie.genres?.join(", ") || ""}
                    onChange={(e) => setEditingMovie({ 
                      ...editingMovie, 
                      genres: e.target.value.split(",").map(s => s.trim()).filter(s => s) 
                    })}
                    placeholder="Action, Drama, Thriller"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-rating">Rating</Label>
                  <Input
                    id="edit-rating"
                    value={editingMovie.rating || ""}
                    onChange={(e) => setEditingMovie({ ...editingMovie, rating: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration (minutes)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={editingMovie.duration_minutes || ""}
                    onChange={(e) => setEditingMovie({ ...editingMovie, duration_minutes: parseInt(e.target.value) || undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-release_date">Release Date</Label>
                  <Input
                    id="edit-release_date"
                    type="date"
                    value={editingMovie.release_date ? editingMovie.release_date.split('T')[0] : ""}
                    onChange={(e) => setEditingMovie({ ...editingMovie, release_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-is_active"
                  checked={editingMovie.is_active}
                  onCheckedChange={(checked) => setEditingMovie({ ...editingMovie, is_active: checked as boolean })}
                />
                <Label htmlFor="edit-is_active" className="text-sm font-medium">
                  Active Movie
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateMovie}
              disabled={isSubmitting || !editingMovie?.title.trim()}
            >
              {isSubmitting ? "Updating..." : "Update Movie"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Movie Preview - {previewingMovie?.title}</DialogTitle>
          </DialogHeader>
          {previewingMovie && (
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Poster */}
                <div className="space-y-2">
                  <Label>Poster</Label>
                  <div className="relative aspect-[2/3] w-full max-w-[200px]">
                    <Image
                      src={previewingMovie.poster_url || "/placeholder.jpg"}
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
                      <Label className="text-sm font-medium text-gray-500">Title</Label>
                      <p className="text-lg font-semibold">{previewingMovie.title}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <p className={`text-sm font-medium ${previewingMovie.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {previewingMovie.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Duration</Label>
                      <p>{previewingMovie.duration_minutes ? `${previewingMovie.duration_minutes} minutes` : 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Rating</Label>
                      <p>{previewingMovie.rating || 'Not rated'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Release Date</Label>
                      <p>{previewingMovie.release_date ? new Date(previewingMovie.release_date).toLocaleDateString() : 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Languages</Label>
                      <p>{previewingMovie.languages?.join(', ') || 'Not specified'}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Genres</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {previewingMovie.genres && previewingMovie.genres.length > 0 ? (
                        previewingMovie.genres.map((genre, index) => (
                          <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {genre}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No genres specified</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Synopsis */}
              {previewingMovie.synopsis && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Synopsis</Label>
                  <p className="mt-2 text-sm leading-relaxed">{previewingMovie.synopsis}</p>
                </div>
              )}

              {/* Cast */}
              {previewingMovie.cast && previewingMovie.cast.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Cast</Label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {previewingMovie.cast.map((castMember, index) => (
                      <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                        <p className="font-medium">{castMember.actor?.name || 'Unknown Actor'}</p>
                        <p className="text-gray-600 text-xs">{castMember.character_name || 'Role not specified'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {previewingMovie.trailer_url && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Trailer URL</Label>
                    <p className="text-sm break-all text-blue-600">{previewingMovie.trailer_url}</p>
                  </div>
                )}
                {previewingMovie.backdrop_url && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Backdrop URL</Label>
                    <p className="text-sm break-all text-blue-600">{previewingMovie.backdrop_url}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsPreviewDialogOpen(false);
              if (previewingMovie) {
                handleEditMovie(previewingMovie.id);
              }
            }}>
              Edit Movie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { listMovies, createMovie, updateMovie, deleteMovie, listTenants, type MovieDTO, type CreateMoviePayload } from "@/lib/superadmin";
import { useToast } from "@/hooks/use-toast";

export function MovieTable({ statusFilter = 'all' }: { statusFilter?: 'all' | 'active' | 'inactive' }) {
  const [movies, setMovies] = useState<MovieDTO[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<MovieDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [newMovie, setNewMovie] = useState<CreateMoviePayload>({
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
  });

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await listMovies();
      setMovies(response.data);
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      toast({
        title: "Error",
        description: "Failed to load movies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const tenantsData = await listTenants();
      setTenants(tenantsData);
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
      toast({
        title: "Error",
        description: "Failed to load tenants",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMovies();
    fetchTenants();
  }, []);

  const handleCreateMovie = async () => {
    if (!newMovie.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (!newMovie.tenant_id) {
      toast({
        title: "Error",
        description: "Please select a tenant",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createMovie(newMovie);
      toast({
        title: "Success",
        description: "Movie created successfully",
      });
      setIsCreateDialogOpen(false);
      setNewMovie({
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
      });
      fetchMovies();
    } catch (error) {
      console.error("Failed to create movie:", error);
      toast({
        title: "Error",
        description: "Failed to create movie",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMovie = async () => {
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

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && movie.is_active) ||
      (statusFilter === 'inactive' && !movie.is_active);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="text-center py-8">Loading movies...</div>;
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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Movie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Movie</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newMovie.title}
                    onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                    placeholder="Enter movie title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={newMovie.language || ""}
                    onChange={(e) => setNewMovie({ ...newMovie, language: e.target.value })}
                    placeholder="e.g., English, Hindi"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenant_id">Tenant *</Label>
                <Select
                  value={newMovie.tenant_id}
                  onValueChange={(value) => setNewMovie({ ...newMovie, tenant_id: value })}
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
                <Label htmlFor="poster_url">Poster URL</Label>
                <Input
                  id="poster_url"
                  value={newMovie.poster_url || ""}
                  onChange={(e) => setNewMovie({ ...newMovie, poster_url: e.target.value })}
                  placeholder="https://example.com/poster.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trailer_url">Trailer URL</Label>
                <Input
                  id="trailer_url"
                  value={newMovie.trailer_url || ""}
                  onChange={(e) => setNewMovie({ ...newMovie, trailer_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="synopsis">Synopsis</Label>
                <Textarea
                  id="synopsis"
                  value={newMovie.synopsis || ""}
                  onChange={(e) => setNewMovie({ ...newMovie, synopsis: e.target.value })}
                  placeholder="Brief description of the movie"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cast">Cast</Label>
                <Input
                  id="cast"
                  value={Array.isArray(newMovie.cast) ? newMovie.cast.join(", ") : ""}
                  onChange={(e) => setNewMovie({ ...newMovie, cast: e.target.value.split(",").map(s => s.trim()).filter(s => s) })}
                  placeholder="Actor 1, Actor 2, Actor 3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={newMovie.genre || ""}
                    onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                    placeholder="e.g., Action, Drama, Comedy"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    value={newMovie.rating || ""}
                    onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })}
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
                    value={newMovie.duration_minutes || ""}
                    onChange={(e) => setNewMovie({ ...newMovie, duration_minutes: parseInt(e.target.value) || undefined })}
                    placeholder="120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="release_date">Release Date</Label>
                  <Input
                    id="release_date"
                    type="date"
                    value={newMovie.release_date || ""}
                    onChange={(e) => setNewMovie({ ...newMovie, release_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateMovie}
                disabled={isSubmitting || !newMovie.title.trim()}
              >
                {isSubmitting ? "Creating..." : "Create Movie"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50">
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
            {filteredMovies.map((movie) => (
              <tr key={movie.id} className="border-b">
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
                    <div className="text-sm text-gray-500">{movie.language}</div>
                  </div>
                </td>
                <td className="px-4 py-2">
                  {movie.genre && (
                    <span className="inline-block bg-gray-200 rounded px-2 py-1 text-xs">
                      {movie.genre}
                    </span>
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
                <td className="px-4 py-2 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingMovie(movie);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMovie(movie.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
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
                  <Label htmlFor="edit-language">Language</Label>
                  <Input
                    id="edit-language"
                    value={editingMovie.language || ""}
                    onChange={(e) => setEditingMovie({ ...editingMovie, language: e.target.value })}
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
                <Label htmlFor="edit-cast">Cast</Label>
                <Input
                  id="edit-cast"
                  value={Array.isArray(editingMovie.cast) ? editingMovie.cast.join(", ") : ""}
                  onChange={(e) => setEditingMovie({ ...editingMovie, cast: e.target.value.split(",").map(s => s.trim()).filter(s => s) })}
                  placeholder="Actor 1, Actor 2, Actor 3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-genre">Genre</Label>
                  <Input
                    id="edit-genre"
                    value={editingMovie.genre || ""}
                    onChange={(e) => setEditingMovie({ ...editingMovie, genre: e.target.value })}
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
              onClick={handleEditMovie}
              disabled={isSubmitting || !editingMovie?.title.trim()}
            >
              {isSubmitting ? "Updating..." : "Update Movie"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

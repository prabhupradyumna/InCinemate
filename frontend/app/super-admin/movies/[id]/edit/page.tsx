"use client"

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MovieForm } from "@/components/super-admin/movie-form";
import { ProtectedRoute } from "@/components/customer/protected-route";
import AdminShell from "@/components/layout/AdminShell";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieDTO } from "@/lib/superadmin";
import { useToast } from "@/hooks/use-toast";

export default function EditMoviePage() {
  const params = useParams();
  const router = useRouter();
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
                  <h1 className="text-xl font-semibold">Edit Movie</h1>
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
                  <h1 className="text-xl font-semibold">Edit Movie</h1>
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
              <div className="flex flex-1 items-center space-x-2">
                <h1 className="text-xl font-semibold">Edit Movie: {movie.title}</h1>
              </div>
            </div>
          </div>
          
          <div className="container px-8 py-8">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight">Edit Movie Details</h2>
                <p className="text-muted-foreground">
                  Update movie information, cast, crew, and media assets.
                </p>
              </div>
              
              <MovieForm
                movie={movie}
                onSuccess={() => {
                  router.push("/super-admin/movies");
                }}
                onCancel={() => {
                  router.push("/super-admin/movies");
                }}
              />
            </div>
          </div>
        </div>
      </AdminShell>
    </ProtectedRoute>
  );
}
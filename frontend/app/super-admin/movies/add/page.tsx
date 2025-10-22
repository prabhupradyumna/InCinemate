"use client"

import { MovieForm } from "@/components/super-admin/movie-form";
import { ProtectedRoute } from "@/components/customer/protected-route";
import AdminShell from "@/components/layout/AdminShell";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AddMovieContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

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
                <h1 className="text-xl font-semibold">{isEditing ? 'Edit Movie' : 'Add New Movie'}</h1>
              </div>
            </div>
          </div>
          
          <div className="container px-8 py-8">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight">{isEditing ? 'Edit Movie' : 'Create New Movie'}</h2>
                <p className="text-muted-foreground">
                  {isEditing 
                    ? 'Update movie details, cast, crew, and media assets.' 
                    : 'Add a comprehensive movie entry with all details, cast, crew, and media assets.'}
                </p>
              </div>
              
              <MovieForm
                editId={editId}
                onSuccess={() => {
                  // Only redirect for new movies, not for updates
                  if (!isEditing) {
                    router.push("/super-admin/movies");
                  }
                  // For edits, stay on the same page to allow further edits
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

export default function AddMoviePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddMovieContent />
    </Suspense>
  );
}
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { MobileLayout } from "@/components/customer/mobile-layout";
import {
  ArrowLeft,
  Loader2,
  Camera,
  Download,
  Eye,
  X,
} from "lucide-react";
import { getMovieDetails } from "@/lib/public";

export default function GalleryPage({
  params,
}: {
  params: { id: string };
}) {
  const [movieData, setMovieData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [filter, setFilter] = useState<string>("all");
  const router = useRouter();

  // Fetch movie details on mount
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const data = await getMovieDetails(params.id);
        setMovieData(data);
      } catch (err: any) {
        console.error("Error fetching movie details:", err);
        setError(err.message || "Failed to load movie details");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMovieDetails();
    }
  }, [params.id]);

  // Loading state
  if (loading) {
    return (
      <>
        {/* Mobile Layout */}
        <div className="md:hidden">
          <MobileLayout showBottomNav={false}>
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground text-lg">
                  Loading gallery...
                </p>
              </div>
            </div>
          </MobileLayout>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground text-lg">
                Loading gallery...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error || !movieData) {
    return (
      <>
        {/* Mobile Layout */}
        <div className="md:hidden">
          <MobileLayout showBottomNav={false}>
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4 max-w-md">
                <div className="text-destructive text-6xl">⚠️</div>
                <h2 className="text-2xl font-bold text-foreground">
                  Not Found
                </h2>
                <p className="text-muted-foreground">
                  {error || "Unable to load gallery"}
                </p>
                <Link href={`/movie/${params.id}`}>
                  <Button className="bg-primary hover:bg-primary/90">
                    Back to Movie
                  </Button>
                </Link>
              </div>
            </div>
          </MobileLayout>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <div className="text-destructive text-6xl">⚠️</div>
              <h2 className="text-2xl font-bold text-foreground">
                Not Found
              </h2>
              <p className="text-muted-foreground">
                {error || "Unable to load gallery"}
              </p>
              <Link href={`/movie/${params.id}`}>
                <Button className="bg-primary hover:bg-primary/90">
                  Back to Movie
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const { movie } = movieData;
  const galleryImages = movie.gallery_images || [];

  // Filter images by type
  const filteredImages = filter === "all" 
    ? galleryImages 
    : galleryImages.filter((img: any) => img.type === filter);

  // Get unique types for filter
  const imageTypes = ["all", ...new Set(galleryImages.map((img: any) => img.type).filter(Boolean))];

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden">
        <MobileLayout showBottomNav={false}>
          <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => router.back()} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Gallery</h1>
                <p className="text-sm text-muted-foreground">{movie.title}</p>
              </div>
            </div>

            {/* Filter */}
            {imageTypes.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {imageTypes.map((type) => (
                  <Button
                    key={type}
                    variant={filter === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(type)}
                    className="whitespace-nowrap"
                  >
                    {type === "all" ? "All" : type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </Button>
                ))}
              </div>
            )}

            {/* Gallery Content */}
            {filteredImages.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Images Available
                </h3>
                <p className="text-muted-foreground">
                  No gallery images available for this movie yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredImages.map((image: any, index: number) => (
                  <div 
                    key={index} 
                    className="group relative aspect-[3/4] bg-muted rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    {image.image_url ? (
                      <Image
                        src={image.image_url}
                        alt={image.name || `Gallery image ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300" />
                    {image.name && (
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-xs font-medium truncate">
                          {image.name}
                        </p>
                        {image.type && (
                          <p className="text-white/70 text-xs capitalize">
                            {image.type.replace('_', ' ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </MobileLayout>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="min-h-screen bg-background">
          <Header />
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/movies" className="hover:text-foreground transition-colors">
                Movies
              </Link>
              <span>/</span>
              <Link href={`/movie/${params.id}`} className="hover:text-foreground transition-colors">
                {movie.title}
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">Gallery</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" onClick={() => router.back()} className="p-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Gallery</h1>
                  <p className="text-muted-foreground">{movie.title}</p>
                </div>
              </div>
            </div>

            {/* Filter */}
            {imageTypes.length > 1 && (
              <div className="flex gap-3 mb-8">
                {imageTypes.map((type) => (
                  <Button
                    key={type}
                    variant={filter === type ? "default" : "outline"}
                    onClick={() => setFilter(type)}
                  >
                    {type === "all" ? "All" : type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </Button>
                ))}
              </div>
            )}

            {/* Gallery Content */}
            {filteredImages.length === 0 ? (
              <div className="text-center py-16">
                <Camera className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-foreground mb-4">
                  No Images Available
                </h3>
                <p className="text-muted-foreground text-lg">
                  No gallery images available for this movie yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredImages.map((image: any, index: number) => (
                  <div 
                    key={index} 
                    className="group relative aspect-[3/4] bg-muted rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => setSelectedImage(image)}
                  >
                    {image.image_url ? (
                      <Image
                        src={image.image_url}
                        alt={image.name || `Gallery image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300" />
                    {image.name && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-sm font-medium truncate">
                          {image.name}
                        </p>
                        {image.type && (
                          <p className="text-white/70 text-xs capitalize">
                            {image.type.replace('_', ' ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            {selectedImage.image_url && (
              <Image
                src={selectedImage.image_url}
                alt={selectedImage.name || "Gallery image"}
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            )}
            {selectedImage.name && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                <p className="text-white text-lg font-medium">
                  {selectedImage.name}
                </p>
                {selectedImage.type && (
                  <p className="text-white/70 text-sm capitalize">
                    {selectedImage.type.replace('_', ' ')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

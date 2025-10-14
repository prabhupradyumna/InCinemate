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
  FileText,
  ExternalLink,
  Calendar,
  User,
} from "lucide-react";
import { getMovieDetails } from "@/lib/public";

export default function NewsReviewsPage({
  params,
}: {
  params: { id: string };
}) {
  const [movieData, setMovieData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
                  Loading news & reviews...
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
                Loading news & reviews...
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
                  {error || "Unable to load news & reviews"}
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
                {error || "Unable to load news & reviews"}
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
  const newsReviews = movie.news_reviews || [];

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
                <h1 className="text-xl font-bold text-foreground">News & Reviews</h1>
                <p className="text-sm text-muted-foreground">{movie.title}</p>
              </div>
            </div>

            {/* News & Reviews Content */}
            {newsReviews.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No News & Reviews
                </h3>
                <p className="text-muted-foreground">
                  No news or reviews available for this movie yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {newsReviews.map((item: any, index: number) => (
                  <div key={index} className="bg-card border border-border rounded-lg p-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-foreground text-base line-clamp-2">
                          {item.title || `Review ${index + 1}`}
                        </h3>
                        {item.youtube_url && (
                          <a
                            href={item.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 ml-2"
                          >
                            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </a>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {item.source && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{item.source}</span>
                          </div>
                        )}
                        {item.published_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(item.published_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {item.youtube_url && (
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                          <iframe
                            src={item.youtube_url.replace('watch?v=', 'embed/')}
                            title={item.title || `Review ${index + 1}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                    </div>
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
              <span className="text-foreground font-medium">News & Reviews</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" onClick={() => router.back()} className="p-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">News & Reviews</h1>
                  <p className="text-muted-foreground">{movie.title}</p>
                </div>
              </div>
            </div>

            {/* News & Reviews Content */}
            {newsReviews.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-foreground mb-4">
                  No News & Reviews
                </h3>
                <p className="text-muted-foreground text-lg">
                  No news or reviews available for this movie yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {newsReviews.map((item: any, index: number) => (
                  <div key={index} className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-foreground text-lg line-clamp-2">
                          {item.title || `Review ${index + 1}`}
                        </h3>
                        {item.youtube_url && (
                          <a
                            href={item.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 ml-2"
                          >
                            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </a>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                        {item.source && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{item.source}</span>
                          </div>
                        )}
                        {item.published_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(item.published_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {item.youtube_url && (
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                          <iframe
                            src={item.youtube_url.replace('watch?v=', 'embed/')}
                            title={item.title || `Review ${index + 1}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

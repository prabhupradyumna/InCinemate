"use client";

import { MobileLayout } from "@/components/customer/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import { useState } from "react";

// Mock trailer data - replace with real API call
const mockTrailers = [
  {
    id: "1",
    title: "Kantara: A Legend Chapter-1",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=225&fit=crop",
    duration: "2:45",
    views: "1.2M",
    releaseDate: "2024-12-15",
    movieId: "1"
  },
  {
    id: "2", 
    title: "RRR Trailer",
    thumbnail: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400&h=225&fit=crop",
    duration: "3:12",
    views: "2.1M",
    releaseDate: "2024-12-10",
    movieId: "2"
  },
  {
    id: "3",
    title: "Salaar Official Trailer",
    thumbnail: "https://images.unsplash.com/photo-1574267432644-f94c8c62fbc3?w=400&h=225&fit=crop", 
    duration: "2:58",
    views: "1.8M",
    releaseDate: "2024-12-08",
    movieId: "3"
  }
];

export default function TrailersPage() {
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);

  return (
    <MobileLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Movie Trailers</h1>
          <p className="text-muted-foreground">Watch the latest movie trailers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTrailers.map((trailer) => (
            <Card key={trailer.id} className="group cursor-pointer hover:shadow-lg transition-all">
              <div className="relative">
                <img
                  src={trailer.thumbnail}
                  alt={trailer.title}
                  className="w-full aspect-video object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <Play className="h-8 w-8 text-white fill-white" />
                  </div>
                </div>
                <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                  {trailer.duration}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                  {trailer.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{trailer.views} views</span>
                  <span>{new Date(trailer.releaseDate).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Coming Soon</h2>
          <div className="bg-muted/30 rounded-lg p-6 text-center">
            <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">More Trailers Coming Soon</h3>
            <p className="text-muted-foreground">
              Stay tuned for the latest movie trailers and exclusive content.
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}

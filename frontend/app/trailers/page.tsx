"use client";

import { MobileLayout } from "@/components/customer/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import { useState } from "react";

// Single trailer data
const trailer = {
  id: "1",
  title: "School Leader Movie Trailer",
  youtubeEmbedUrl: "https://www.youtube.com/embed/IWOfU0xmQXU?si=cmWkfjKU8ZUssWdQ",
  duration: "2:45",
  releaseDate: "05-30-2025"
};

export default function TrailersPage() {
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);

  return (
    <MobileLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Movie Trailers</h1>
          <p className="text-muted-foreground">Watch movie trailers</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <div className="relative">
              <iframe
                src={trailer.youtubeEmbedUrl}
                title={trailer.title}
                className="w-full aspect-video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                {trailer.title}
              </h3>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Release Date : {new Date(trailer.releaseDate).toLocaleDateString('en-GB')}</span>
              </div>
            </CardContent>
          </Card>
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

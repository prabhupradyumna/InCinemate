"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SeatSelection } from "@/components/seat-selection";
import { Header } from "@/components/header";
import { BookingSummary } from "@/components/booking-summary";
import { Separator } from "@/components/ui/separator";

type PublicMovie = {
  id: string;
  title: string;
  poster_url: string;
  banner_url?: string;
  genres: string[];
  duration: string; // e.g., "165"
  release_date: string;
  rating: number;
};

export default function BookingPage({
  params,
}: {
  params: { movieId: string };
}) {
  const [movie, setMovie] = useState<PublicMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Array<{ row: string; seat: number; type: "premium" | "regular" }>>([]);

  // Stable updater that only sets state when selection truly changes
  const handleSelectionChange = useCallback(
    (seats: Array<{ row: string; seat: number; type: "premium" | "regular" }>) => {
      setSelectedSeats((prev) => {
        if (prev.length === seats.length) {
          let same = true;
          for (let i = 0; i < prev.length; i++) {
            const a = prev[i];
            const b = seats[i];
            if (!b || a.row !== b.row || a.seat !== b.seat || a.type !== b.type) {
              same = false;
              break;
            }
          }
          if (same) return prev; // do not trigger re-render
        }
        return seats;
      });
    },
    []
  );

  useEffect(() => {
    const loadMovie = async () => {
      try {
        const res = await fetch("/Movie_data/movies_dummy_dataset.json");
        const data: PublicMovie[] = await res.json();
        const found = data.find((m) => String(m.id) === String(params.movieId));
        if (!found) {
          setError("Movie not found");
        }
        setMovie(found || null);
      } catch (e) {
        setError("Failed to load movie data");
      } finally {
        setLoading(false);
      }
    };
    loadMovie();
  }, [params.movieId]);

  // Build a mock show object around the selected movie
  const showData = useMemo(() => {
    const title = movie?.title || "Loading";
    const durationNumber = movie?.duration ? parseInt(movie.duration, 10) || 120 : 120;
    const ratingStr = movie ? String(movie.rating) : "PG-13";

    return {
      movie: {
        id: String(params.movieId),
        title,
        genre: movie?.genres?.join("/") || "",
        duration: durationNumber,
        rating: ratingStr,
        posterUrl: movie?.banner_url || movie?.poster_url || "/placeholder.svg",
      },
      venue: {
        name: "Downtown Cinema",
        address: "123 Main Street, New York, NY",
      },
      screen: {
        name: "Screen 1",
        seatMap: {
          rows: [
            { row: "A", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], type: "premium" },
            { row: "B", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], type: "premium" },
            { row: "C", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], type: "regular" },
            { row: "D", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], type: "regular" },
            { row: "E", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], type: "regular" },
            { row: "F", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], type: "regular" },
            { row: "G", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], type: "regular" },
            { row: "H", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], type: "regular" },
          ],
        },
      },
      showtime: {
        date: movie?.release_date || "2024-12-15", // placeholder
        time: "7:00 PM",
        pricing: {
          premium: 18.0,
          regular: 12.0,
        },
      },
      bookedSeats: [
        { row: "A", seat: 5 },
        { row: "A", seat: 6 },
        { row: "C", seat: 8 },
        { row: "D", seat: 3 },
        { row: "D", seat: 4 },
        { row: "F", seat: 7 },
      ],
    };
  }, [movie, params.movieId]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center text-muted-foreground">Loading movie...</div>
        ) : error ? (
          <div className="max-w-xl mx-auto text-center space-y-2">
            <h2 className="text-xl font-semibold">{error}</h2>
            <p className="text-sm text-muted-foreground">Please go back and choose a different movie.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <SeatSelection
                showData={showData as any}
                onSelectionChange={(seats) =>
                  handleSelectionChange(seats.map((s) => ({ row: s.row, seat: s.seat, type: s.type })))}
              />
            </div>
            <div className="lg:col-span-1">
              <BookingSummary showData={showData as any} selectedSeats={selectedSeats} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSeatMap } from "@/lib/api";
import { SeatSelection } from "@/components/customer/seat-selection";
import { Header } from "@/components/header";
import { BookingSummary } from "@/components/customer/booking-summary";
import { Separator } from "@/components/ui/separator";
import { SeatQuantitySelector } from "@/components/customer/seat-quantity-selector";
import { SeatSelectionSummary } from "@/components/customer/seat-selection-summary";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showData, setShowData] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<
    Array<{
      id: string;
      row: string;
      seat: number;
      type: "premium" | "regular";
    }>
  >([]);
  const [showQuantitySelector, setShowQuantitySelector] = useState(true);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [showBookingFlow, setShowBookingFlow] = useState(false);

  // Stable updater that only sets state when selection truly changes
  const handleSelectionChange = useCallback((seats: any[]) => {
    setSelectedSeats(seats);
  }, []);

  useEffect(() => {
    const loadSeatMap = async () => {
      try {
        // Here movieId param carries selected showId
        const showId = params.movieId;
        const apiResp = await getSeatMap(showId);
        // API returns { data: { show, seat_map, seats_flat, statistics }, message }
        const apiData = (apiResp as any)?.data ?? apiResp ?? {};

        // Transform API shape to SeatSelection expected shape
        // Prefer seat_map; if empty, attempt to build from seats_flat
        const mapType = (cat: any): "premium" | "regular" => {
          const c = String(cat || "").toLowerCase();
          return c === "regular" ? "regular" : "premium";
        };

        const seatIdMap: Record<string, string> = {};
        let rows = Object.entries(apiData.seat_map || {}).map(
          ([row, seats]: any) => {
            (seats || []).forEach((s: any) => {
              seatIdMap[`${s.row}-${s.number}`] = s.id;
            });
            return {
              row,
              seats: (seats || []).map((s: any) => s.number),
              type: mapType(seats && seats[0]?.category),
            };
          }
        );
        if ((!rows || rows.length === 0) && Array.isArray(apiData.seats_flat)) {
          const grouped: Record<string, any[]> = {} as any;
          apiData.seats_flat.forEach((s: any) => {
            if (!grouped[s.row]) grouped[s.row] = [];
            grouped[s.row].push(s);
          });
          rows = Object.entries(grouped).map(([row, seats]: any) => {
            (seats || []).forEach((s: any) => {
              seatIdMap[`${s.row}-${s.number}`] = s.id;
            });
            return {
              row,
              seats: (seats || []).map((s: any) => s.number),
              type: mapType(seats && seats[0]?.category),
            };
          });
        }
        const bookedSeats = Object.values(apiData.seat_map || {})
          .flat()
          .filter((s: any) => s.is_available === false)
          .map((s: any) => ({ row: s.row, seat: s.number }));

        const show = apiData.show || {};
        const movie = show.movie || {};
        const auditorium = show.auditorium || {};
        const theatre = show.theatre || {};
        const dt = show.show_datetime ? new Date(show.show_datetime) : null;

        const transformed = {
          // include show meta that downstream might need
          show: { id: show.id },
          movie: {
            id: movie.id,
            title: movie.title,
            genre: Array.isArray(movie.genres)
              ? movie.genres[0] || ""
              : movie.genre || "",
            duration: movie.duration_minutes || 0,
            rating: movie.rating || "",
            posterUrl: movie.poster_url || "",
          },
          venue: {
            name: theatre.name || "",
            address: theatre.address || "",
          },
          screen: {
            name: auditorium.name || "Screen",
            seatMap: { rows },
          },
          showtime: {
            date: dt ? dt.toISOString() : "",
            time: dt
              ? dt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            pricing: show.pricing || { premium: 0, regular: 0 },
          },
          bookedSeats,
          seatIdMap,
        } as any;

        setShowData(transformed);
      } catch (e: any) {
        setError(
          e?.response?.data?.error || e.message || "Failed to load seat map"
        );
      } finally {
        setLoading(false);
      }
    };
    loadSeatMap();
  }, [params.movieId]);

  // Seat categories with pricing and availability
  const seatCategories = useMemo(
    () => [
      { name: "RECLINER", price: 500, status: "sold_out" as const },
      { name: "GOLD", price: 330, status: "sold_out" as const },
      { name: "SILVER", price: 330, status: "almost_full" as const },
      { name: "SPECIAL", price: 330, status: "available" as const },
    ],
    []
  );

  const handleQuantityConfirm = (quantity: number) => {
    setSelectedQuantity(quantity);
    setShowQuantitySelector(false);
  };

  const handlePayNow = () => {
    if (selectedSeats.length === 0) return;
    setShowBookingFlow(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center text-muted-foreground">
            Loading movie...
          </div>
        ) : error ? (
          <div className="max-w-xl mx-auto text-center space-y-2">
            <h2 className="text-xl font-semibold">{error}</h2>
            <p className="text-sm text-muted-foreground">
              Please go back and choose a different movie.
            </p>
          </div>
        ) : !showData ? (
          <div className="min-h-[300px] flex items-center justify-center text-muted-foreground">
            Show details not available.
          </div>
        ) : showBookingFlow ? (
          <BookingSummary
            showId={showData.show.id}
            showData={showData}
            selectedSeats={selectedSeats}
            selectedQuantity={selectedQuantity}
            onBack={() => setShowBookingFlow(false)}
          />
        ) : (
          <>
            <div className="space-y-6 sm:space-y-8">
              <div className="w-full">
                <SeatSelection
                  showData={showData}
                  onSelectionChange={handleSelectionChange}
                  maxSeats={selectedQuantity}
                />
              </div>
              <div className="flex justify-center px-2 sm:px-0">
                <div className="w-full max-w-md">
                  <SeatSelectionSummary
                    showData={showData}
                    selectedSeats={selectedSeats}
                    selectedQuantity={selectedQuantity}
                    onPayNow={handlePayNow}
                  />
                </div>
              </div>
            </div>
            <SeatQuantitySelector
              isOpen={showQuantitySelector}
              onClose={() => setShowQuantitySelector(false)}
              onConfirm={handleQuantityConfirm}
              categories={seatCategories}
              selectedQuantity={selectedQuantity}
            />
          </>
        )}
      </main>
    </div>
  );
}

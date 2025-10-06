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
    Array<{ id: string; row: string; seat: number; type: "premium" | "regular" }>
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
        // FIXME: This needs a real showId from the previous page
        const showId = params.movieId; // Assuming movieId is the showId for now
        const res = await getSeatMap(showId);
        setShowData(res.data);
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

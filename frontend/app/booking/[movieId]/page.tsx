"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSeatMap } from "@/lib/api";
import { SeatSelection } from "@/components/customer/seat-selection";
import { Header } from "@/components/header";
import { MobileLayout } from "@/components/customer/mobile-layout";
import { BookingSummary } from "@/components/customer/booking-summary";
import { SimpleBookingSummary } from "@/components/customer/simple-booking-summary";
import { Separator } from "@/components/ui/separator";
import { SeatQuantitySelector } from "@/components/customer/seat-quantity-selector";
import { SeatSelectionSummary } from "@/components/customer/seat-selection-summary";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/components/customer/auth-provider";

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
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showData, setShowData] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<
    Array<{
      id: string;
      row: string;
      seat: number;
      type: "vip" | "diamond" | "platinum" | "gold" | "silver";
      price?: number; // Individual seat price
    }>
  >([]);
  const [showQuantitySelector, setShowQuantitySelector] = useState(true);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [simpleBookingData, setSimpleBookingData] = useState<any>(null);

  // Determine if user is admin/superadmin (direct booking) or public (reservation)
  const isAdminUser = user && (user.role === 'admin' || user.role === 'super-admin');
  const isDirectBooking = isAdminUser;

  // Stable updater that only sets state when selection truly changes
  const handleSelectionChange = useCallback((seats: any[]) => {
    setSelectedSeats(seats);
  }, []);

  // Handle back navigation - check if there's an active booking
  const handleBackFromBooking = useCallback(() => {
    if (activeBookingId) {
      // There's an active booking, don't go back - the BookingSummary component will handle the cancel popup
      // The component's back button will show the cancel popup instead
      return;
    } else {
      // No active booking, safe to go back
      setShowBookingFlow(false);
    }
  }, [activeBookingId]);

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

        const seatIdMap: Record<string, string> = {};
        let rows = Object.entries(apiData.seat_map || {}).map(
          ([row, seats]: any) => {
            (seats || []).forEach((s: any) => {
              seatIdMap[`${s.row}-${s.number}`] = s.id;
            });
            return {
              row,
              seats: (seats || []).map((s: any) => s.number),
              type: normalizeCategory(seats && seats[0]?.category),
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
              type: normalizeCategory(seats && seats[0]?.category),
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
            pricing:
              show.pricing ||
              { vip: 0, diamond: 0, platinum: 0, gold: 0, silver: 0 },
          },
          bookedSeats,
          seatIdMap,
          seats_flat: apiData.seats_flat || [], // Include seats_flat for category analysis
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

  // Helper function to normalize seat categories
  const normalizeCategory = (
    cat: any
  ): "vip" | "diamond" | "platinum" | "gold" | "silver" => {
    const c = String(cat || "").toLowerCase();
    if (c.includes("vip")) return "vip";
    if (c.includes("diamond")) return "diamond";
    if (c.includes("platinum")) return "platinum";
    if (c.includes("gold")) return "gold";
    if (c.includes("silver")) return "silver";
    // Fallback: treat unknown as gold
    return "gold";
  };

  // Seat categories with pricing and availability from backend data
  const seatCategories = useMemo(() => {
    if (!showData) return [];

    const pricing = showData.showtime?.pricing || {};
    const seatsFlat = (showData as any)?.seats_flat || [];

    // Extract unique categories from seats
    const categoryMap = new Map();

    seatsFlat.forEach((seat: any) => {
      // Normalize category to our new seat types
      const normalizedCategory = normalizeCategory(seat.category);
      const categoryKey = normalizedCategory.toUpperCase();
      
      if (!categoryMap.has(categoryKey)) {
        categoryMap.set(categoryKey, {
          name: normalizedCategory,
          price: pricing[normalizedCategory] || pricing[seat.category] || pricing[`row_${seat.row}`] || 250,
          totalSeats: 0,
          availableSeats: 0,
        });
      }

      const cat = categoryMap.get(categoryKey);
      cat.totalSeats++;
      if (seat.is_available) {
        cat.availableSeats++;
      }
    });

    // Convert to array and determine status
    return Array.from(categoryMap.values()).map((cat) => {
      let status: "available" | "almost_full" | "sold_out";
      const availabilityRatio = cat.availableSeats / cat.totalSeats;

      if (availabilityRatio === 0) {
        status = "sold_out";
      } else if (availabilityRatio < 0.2) {
        status = "almost_full";
      } else {
        status = "available";
      }

      return {
        name: cat.name,
        price: cat.price,
        status,
      };
    });
  }, [showData]);

  const handleQuantityConfirm = (quantity: number) => {
    setSelectedQuantity(quantity);
    setShowQuantitySelector(false);
  };

  const handlePayNow = async () => {
    if (selectedSeats.length === 0) return;

    if (isDirectBooking) {
      // For admin/superadmin users, use the existing booking flow
      setShowBookingFlow(true);
    } else {
      // For public users, create a simple booking without authentication
      try {
        const isPremiumType = (t: any) =>
          t === 'vip' || t === 'diamond' || t === 'platinum';
        const mapCategory = (t: any) => {
          // Map to our new seat types
          if (t === 'vip') return 'vip';
          if (t === 'diamond') return 'diamond';
          if (t === 'platinum') return 'platinum';
          if (t === 'gold') return 'gold';
          if (t === 'silver') return 'silver';
          // Fallback for unknown types
          return isPremiumType(t) ? 'vip' : 'gold';
        };
        // Create a simple booking data structure for public users
        const bookingData = {
          booking_id: `temp_${Date.now()}`, // Temporary ID
          booking_reference: `REF${Date.now()}`,
          seats: selectedSeats.map(seat => ({
            id: (seat as any).id,
            row: seat.row,
            number: seat.seat,
            category: mapCategory(seat.type),
            price: seat.price || (isPremiumType(seat.type) ? 250 : 200)
          })),
          subtotal: selectedSeats.reduce((sum, seat) => sum + (seat.price || (isPremiumType(seat.type) ? 250 : 200)), 0),
          total_price: selectedSeats.reduce((sum, seat) => sum + (seat.price || (isPremiumType(seat.type) ? 250 : 200)), 0),
          hold_expires_at: new Date(Date.now() + 3600000).toISOString()
        } as any;

        setSimpleBookingData(bookingData);
        setShowBookingFlow(true);
      } catch (error) {
        console.error('Error creating simple booking:', error);
        setError('Failed to create booking. Please try again.');
      }
    }
  };

  return (
    <MobileLayout showBottomNav={false}>
      {/* Desktop Header */}
      <div className="hidden md:block absolute top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <div>
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">
            {showData?.movie?.title || "Movie"}
          </span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Seat Selection</span>
        </div>

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
          isDirectBooking ? (
            <BookingSummary
              showId={showData.show.id}
              showData={showData}
              selectedSeats={selectedSeats}
              selectedQuantity={selectedQuantity}
              onBack={handleBackFromBooking}
              onBookingCreated={setActiveBookingId}
              onBookingCancelled={() => setActiveBookingId(null)}
            />
          ) : (
            <SimpleBookingSummary
              showData={showData}
              bookingDetails={simpleBookingData}
              onBookingComplete={(bookingId) => {
                console.log("Simple booking completed:", bookingId);
                setActiveBookingId(bookingId);
              }}
            />
          )
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
      </div>
    </MobileLayout>
  );
}

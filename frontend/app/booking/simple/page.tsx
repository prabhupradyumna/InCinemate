"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { SimpleBookingSummary } from "@/components/customer/simple-booking-summary";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


interface ShowData {
  movie: {
    id: string;
    title: string;
    genre: string;
    duration: number;
    rating: string;
    posterUrl: string;
  };
  venue: {
    name: string;
    address: string;
  };
  screen: {
    name: string;
    seatMap: {
      rows: Array<{
        row: string;
        seats: number[];
        type: "vip" | "diamond" | "platinum" | "gold" | "silver";
      }>;
    };
  };
  showtime: {
    date: string;
    time: string;
    pricing: {
      vip: number;
      diamond: number;
      platinum: number;
      gold: number;
      silver: number;
    };
  };
}

interface BookingDetails {
  booking_id: string;
  booking_reference: string;
  seats: Array<{
    id: string;
    row: string;
    number: number;
    category: string;
    price: number;
  }>;
  subtotal: number;
  total_price: number;
  hold_expires_at: string;
}

export default function SimpleBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showData, setShowData] = useState<ShowData | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bookingId = searchParams.get("booking_id");

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails(bookingId);
    } else {
      setError("Booking ID not found");
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for demonstration - in real implementation, fetch from API
      const mockShowData: ShowData = {
        movie: {
          id: "1",
          title: "School Leader",
          genre: "Drama",
          duration: 170,
          rating: "U/A",
          posterUrl: "/placeholder.jpg"
        },
        venue: {
          name: "Bharath Cinemas",
          address: "Bejai KSRTC"
        },
        screen: {
          name: "Audi-01",
          seatMap: {
            rows: []
          }
        },
        showtime: {
          date: "2025-01-15",
          time: "14:30",
          pricing: {
            vip: 250,
            diamond: 200,
            platinum: 150,
            gold: 100,
            silver: 50
          }
        }
      };

      
      setShowData(mockShowData);

    } catch (err: any) {
      console.error("Error fetching booking details:", err);
      setError(err.message || "Failed to fetch booking details");
    } finally {
      setLoading(false);
    }
  };

  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !showData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => router.push("/")} className="w-full">
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SimpleBookingSummary
      showData={showData}
      bookingDetails ={{}}
      onBookingComplete={(bookingId) => {
        console.log("Booking completed:", bookingId);
      }}
    />
  );
}

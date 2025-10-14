"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/customer/auth-provider";

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
  bookedSeats: Array<{
    row: string;
    seat: number;
  }>;
}

interface SeatSelectionSummaryProps {
  showData: ShowData;
  selectedSeats: Array<{
    row: string;
    seat: number;
    type: "vip" | "diamond" | "platinum" | "gold" | "silver";
    price?: number; // Individual seat price
  }>;
  selectedQuantity: number;
  onPayNow: () => void;
}

export function SeatSelectionSummary({
  showData,
  selectedSeats,
  selectedQuantity,
  onPayNow,
}: SeatSelectionSummaryProps) {
  const { user } = useAuth();
  
  // Determine if user is admin/superadmin (can see pricing)
  const isAdminUser = user && (user.role === 'admin' || user.role === 'super-admin');
  
  const subtotal = selectedSeats.reduce((total, seat) => {
    // Use individual seat price if available, fallback to category pricing
    const seatPrice = seat.price || showData.showtime.pricing[seat.type];
    return total + seatPrice;
  }, 0);

  const total = subtotal;

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        {/* Simple Ticket Counter */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-medium">Tickets</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm px-3 py-1">
              {selectedSeats.length} / {selectedQuantity} Selected
            </Badge>
            {selectedSeats.length < selectedQuantity && (
              <span className="text-sm text-muted-foreground">
                ({selectedQuantity - selectedSeats.length} more needed)
              </span>
            )}
          </div>
        </div>

        {/* Reserve Seats Button */}
        <Button
          className="w-full bg-red-500 hover:bg-red-600 text-white text-lg py-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={onPayNow}
          disabled={selectedSeats.length !== selectedQuantity}
        >
          {selectedSeats.length === selectedQuantity
            ? isAdminUser 
              ? `Pay ₹${total.toFixed(0)}`
              : "Reserve Seats"
            : `Select ${selectedQuantity - selectedSeats.length} more seat${selectedQuantity - selectedSeats.length !== 1 ? "s" : ""}`}
        </Button>
      </CardContent>
    </Card>
  );
}

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
        type: "premium" | "regular";
      }>;
    };
  };
  showtime: {
    date: string;
    time: string;
    pricing: {
      premium: number;
      regular: number;
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
    type: "premium" | "regular";
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
  const subtotal = selectedSeats.reduce((total, seat) => {
    return total + showData.showtime.pricing[seat.type];
  }, 0);

  const convenienceFee = 2.5;
  const total = subtotal + convenienceFee;

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

        {/* Pay Now Button */}
        <Button
          className="w-full bg-red-500 hover:bg-red-600 text-white text-lg py-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={onPayNow}
          disabled={selectedSeats.length !== selectedQuantity}
        >
          {selectedSeats.length === selectedQuantity
            ? `Pay ₹${total.toFixed(0)}`
            : `Select ${selectedQuantity - selectedSeats.length} more seat${selectedQuantity - selectedSeats.length !== 1 ? "s" : ""}`}
        </Button>
      </CardContent>
    </Card>
  );
}

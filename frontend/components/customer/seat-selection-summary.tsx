"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/customer/auth-provider";
import { Edit3 } from "lucide-react";

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
  onEditQuantity?: () => void;
}

export function SeatSelectionSummary({
  showData,
  selectedSeats,
  selectedQuantity,
  onPayNow,
  onEditQuantity,
}: SeatSelectionSummaryProps) {
  const { user } = useAuth();

  // Determine if user is admin/superadmin (can see pricing)
  const isAdminUser = user && (user.role === 'admin' || user.role === 'super-admin');

  // Color mapping for seat types
  const getSeatTypeColors = (type: string) => {
    switch (type) {
      case "vip":
        return { bg: "bg-purple-200", border: "border-purple-400" };
      case "diamond":
        return { bg: "bg-cyan-200", border: "border-cyan-400" };
      case "platinum":
        return { bg: "bg-gray-200", border: "border-gray-400" };
      case "gold":
        return { bg: "bg-yellow-200", border: "border-yellow-400" };
      case "silver":
        return { bg: "bg-slate-200", border: "border-slate-400" };
      default:
        return { bg: "bg-secondary", border: "border-border" };
    }
  };

  const subtotal = selectedSeats.reduce((total, seat) => {
    // Use individual seat price if available, fallback to category pricing
    const seatPrice = seat.price || showData.showtime.pricing[seat.type];
    return total + seatPrice;
  }, 0);

  const total = subtotal;

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-3 sm:p-4">
        {/* Ticket Counter */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-base sm:text-lg font-semibold text-foreground">Tickets</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs sm:text-sm px-2.5 py-1 font-medium">
              {selectedSeats.length} / {selectedQuantity} Selected
            </Badge>
            {onEditQuantity && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditQuantity}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
            {selectedSeats.length < selectedQuantity && (
              <span className="text-xs sm:text-sm text-muted-foreground">
                ({selectedQuantity - selectedSeats.length} more needed)
              </span>
            )}
          </div>
        </div>

        {/* Selected Seats - compact chips, no type shown */}
        {selectedSeats.length > 0 && (
          <div className="space-y-2 mb-3">
            <div className="text-xs sm:text-sm font-medium text-muted-foreground">Selected Seats</div>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
              {selectedSeats.map((seat, index) => (
                <div
                  key={index}
                  className="px-2 py-1 rounded-md bg-muted/60 border border-border/50 text-xs sm:text-sm font-medium text-foreground"
                >
                  {seat.row}{seat.seat}
                </div>
              ))}
            </div>

            {/* Total Price (admins only) */}
            {isAdminUser && (
              <div className="flex justify-between items-center pt-2 border-t border-border/60">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-base sm:text-lg font-bold text-primary">AED {total.toFixed(0)}</span>
              </div>
            )}
          </div>
        )}

        {/* Reserve Seats Button */}
        <Button
          className="w-full bg-red-500 hover:bg-red-600 text-white text-sm sm:text-base py-3 sm:py-4 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={onPayNow}
          disabled={selectedSeats.length !== selectedQuantity}
        >
          {selectedSeats.length === selectedQuantity
            ? isAdminUser
              ? `Pay AED ${total.toFixed(0)}`
              : "Reserve Seats"
            : `Select ${selectedQuantity - selectedSeats.length} more seat${selectedQuantity - selectedSeats.length !== 1 ? "s" : ""}`}
        </Button>
      </CardContent>
    </Card>
  );
}

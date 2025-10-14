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
      <CardContent className="p-4 sm:p-6">
        {/* Ticket Counter */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-foreground">Tickets</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm px-3 py-1 font-medium">
              {selectedSeats.length} / {selectedQuantity} Selected
            </Badge>
            {selectedSeats.length < selectedQuantity && (
              <span className="text-sm text-muted-foreground">
                ({selectedQuantity - selectedSeats.length} more needed)
              </span>
            )}
          </div>
        </div>

        {/* Selected Seats Breakdown */}
        {selectedSeats.length > 0 && (
          <div className="space-y-4 mb-6">
            <div className="text-sm font-medium text-muted-foreground">Selected Seats:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedSeats.map((seat, index) => {
                const colors = getSeatTypeColors(seat.type);
                const seatPrice = seat.price || showData.showtime.pricing[seat.type];
                
                return (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <div className={`w-5 h-5 ${colors.bg} ${colors.border} border rounded-sm flex-shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{seat.row}{seat.seat}</div>
                      <div className="text-xs text-muted-foreground capitalize">{seat.type}</div>
                    </div>
                    {isAdminUser && (
                      <div className="text-sm font-medium text-primary">AED {seatPrice}</div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Total Price */}
            {isAdminUser && (
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="text-base font-semibold text-foreground">Total:</span>
                <span className="text-xl font-bold text-primary">AED {total.toFixed(0)}</span>
              </div>
            )}
          </div>
        )}

        {/* Reserve Seats Button */}
        <Button
          className="w-full bg-red-500 hover:bg-red-600 text-white text-lg py-4 sm:py-6 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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

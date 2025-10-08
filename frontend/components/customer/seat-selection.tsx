"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Monitor } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SeatData {
  row: string;
  seat: number;
  type: "premium" | "regular";
  status: "available" | "selected" | "booked";
  price?: number; // Individual seat price
  id?: string; // Seat ID for backend operations
}

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
  seats_flat?: Array<{
    id: string;
    row: string;
    number: number;
    category: string;
    price: number;
    is_available: boolean;
  }>; // Individual seat data with prices
}

interface SeatSelectionProps {
  showData: ShowData;
  onSelectionChange?: (seats: SeatData[]) => void;
  maxSeats?: number;
}

export function SeatSelection({
  showData,
  onSelectionChange,
  maxSeats,
}: SeatSelectionProps) {
  const [selectedSeats, setSelectedSeats] = useState<SeatData[]>([]);

  // Create seat data with status and individual pricing
  const createSeatData = (): SeatData[] => {
    const seats: SeatData[] = [];

    showData.screen.seatMap.rows.forEach((rowData) => {
      rowData.seats.forEach((seatNumber) => {
        const isBooked = showData.bookedSeats.some(
          (bookedSeat) =>
            bookedSeat.row === rowData.row && bookedSeat.seat === seatNumber
        );
        const isSelected = selectedSeats.some(
          (selectedSeat) =>
            selectedSeat.row === rowData.row && selectedSeat.seat === seatNumber
        );

        // Find individual seat data with price
        const seatData = showData.seats_flat?.find(
          (seat) => seat.row === rowData.row && seat.number === seatNumber
        );

        seats.push({
          row: rowData.row,
          seat: seatNumber,
          type: rowData.type,
          status: isBooked ? "booked" : isSelected ? "selected" : "available",
          price: seatData?.price, // Use individual seat price
          id: seatData?.id, // Include seat ID
        });
      });
    });

    return seats;
  };

  const handleSeatClick = (clickedSeat: SeatData) => {
    if (clickedSeat.status === "booked") return;

    const seatKey = `${clickedSeat.row}-${clickedSeat.seat}`;
    const isSelected = selectedSeats.some(
      (seat) => seat.row === clickedSeat.row && seat.seat === clickedSeat.seat
    );

    if (isSelected) {
      setSelectedSeats((prev) =>
        prev.filter(
          (seat) =>
            !(seat.row === clickedSeat.row && seat.seat === clickedSeat.seat)
        )
      );
    } else {
      const maxAllowed = maxSeats || 8;
      if (selectedSeats.length < maxAllowed) {
        setSelectedSeats((prev) => [...prev, clickedSeat]);
      }
    }
  };

  // Notify parent when selection changes
  useEffect(() => {
    onSelectionChange?.(selectedSeats);
  }, [selectedSeats, onSelectionChange]);

  const getSeatButtonClass = (seat: SeatData) => {
    const baseClass =
      "w-8 h-8 text-xs font-medium rounded-md transition-all duration-200 border-2";

    switch (seat.status) {
      case "booked":
        return `${baseClass} bg-destructive/20 border-destructive/40 text-destructive cursor-not-allowed`;
      case "selected":
        return `${baseClass} bg-primary border-primary text-primary-foreground cinema-glow cursor-pointer hover:scale-105`;
      case "available":
        if (seat.type === "premium") {
          return `${baseClass} bg-accent/20 border-accent/40 text-accent-foreground cursor-pointer hover:bg-accent/30 hover:border-accent/60 hover:scale-105`;
        }
        return `${baseClass} bg-secondary border-border text-secondary-foreground cursor-pointer hover:bg-secondary/80 hover:border-border/80 hover:scale-105`;
      default:
        return baseClass;
    }
  };

  const seatData = createSeatData();
  const totalPrice = selectedSeats.reduce((total, seat) => {
    // Use individual seat price if available, fallback to category pricing
    const seatPrice = seat.price || showData.showtime.pricing[seat.type];
    return total + seatPrice;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Movie Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-16 sm:w-16 sm:h-24 bg-muted rounded-lg flex items-center justify-center">
              <Monitor className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold">
                {showData.movie.title}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{showData.venue.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(showData.showtime.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{showData.showtime.time}</span>
                </div>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Seat Map */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Select Your Seats</span>
            <Badge variant="outline">{showData.screen.name}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Screen */}
          <div className="flex justify-center">
            <div className="w-2/3 sm:w-3/4 h-1 sm:h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full opacity-60"></div>
          </div>
          <div className="text-center text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-8">
            SCREEN
          </div>

          {/* Seat Grid */}
          <div className="space-y-2 sm:space-y-3 overflow-x-auto">
            {showData.screen.seatMap.rows.map((rowData) => (
              <div
                key={rowData.row}
                className="flex items-center justify-center gap-1 sm:gap-2 min-w-max"
              >
                <div className="w-6 sm:w-8 text-center font-medium text-muted-foreground text-xs sm:text-sm">
                  {rowData.row}
                </div>
                <div className="flex gap-0.5 sm:gap-1">
                  {rowData.seats.map((seatNumber) => {
                    const seat = seatData.find(
                      (s) => s.row === rowData.row && s.seat === seatNumber
                    )!;
                    return (
                      <Button
                        key={`${rowData.row}-${seatNumber}`}
                        variant="ghost"
                        size="sm"
                        className={`${getSeatButtonClass(seat)} w-6 h-6 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm touch-manipulation`}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status === "booked"}
                      >
                        {seatNumber}
                      </Button>
                    );
                  })}
                </div>
                <div className="w-6 sm:w-8 text-center font-medium text-muted-foreground text-xs sm:text-sm">
                  {rowData.row}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 pt-4 sm:pt-6 border-t border-border">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-secondary border-2 border-border rounded-md"></div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Available
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-accent/20 border-2 border-accent/40 rounded-md"></div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Premium
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-primary border-2 border-primary rounded-md"></div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Selected
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-destructive/20 border-2 border-destructive/40 rounded-md"></div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Booked
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="font-medium text-sm sm:text-base">
                  Selected Seats:
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {selectedSeats
                    .map((seat) => `${seat.row}${seat.seat}`)
                    .join(", ")}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  ₹{totalPrice.toFixed(2)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {selectedSeats.length} seat(s)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Monitor } from "lucide-react";
import { useAuth } from "@/components/customer/auth-provider";

interface SeatData {
  row: string;
  seat: number;
  type: "vip" | "diamond" | "platinum" | "gold" | "silver";
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
  const { user } = useAuth();
  
  // Determine if user is admin/superadmin (can see pricing)
  const isAdminUser = user && (user.role === 'admin' || user.role === 'super-admin');

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

  // Color mapping for seat types
  const getSeatTypeColors = (type: string) => {
    switch (type) {
      case "vip":
        return {
          bg: "bg-purple-200",
          border: "border-purple-400",
          text: "text-purple-800",
          hover: "hover:bg-purple-300 hover:border-purple-500",
          legend: "bg-purple-200 border-purple-400"
        };
      case "diamond":
        return {
          bg: "bg-cyan-200",
          border: "border-cyan-400",
          text: "text-cyan-800",
          hover: "hover:bg-cyan-300 hover:border-cyan-500",
          legend: "bg-cyan-200 border-cyan-400"
        };
      case "platinum":
        return {
          bg: "bg-gray-200",
          border: "border-gray-400",
          text: "text-gray-800",
          hover: "hover:bg-gray-300 hover:border-gray-500",
          legend: "bg-gray-200 border-gray-400"
        };
      case "gold":
        return {
          bg: "bg-yellow-200",
          border: "border-yellow-400",
          text: "text-yellow-800",
          hover: "hover:bg-yellow-300 hover:border-yellow-500",
          legend: "bg-yellow-200 border-yellow-400"
        };
      case "silver":
        return {
          bg: "bg-slate-200",
          border: "border-slate-400",
          text: "text-slate-800",
          hover: "hover:bg-slate-300 hover:border-slate-500",
          legend: "bg-slate-200 border-slate-400"
        };
      default:
        return {
          bg: "bg-secondary",
          border: "border-border",
          text: "text-secondary-foreground",
          hover: "hover:bg-secondary/80 hover:border-border/80",
          legend: "bg-secondary border-border"
        };
    }
  };

  const getSeatButtonClass = (seat: SeatData) => {
    const baseClass =
      "text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 border-2 shadow-sm";

    switch (seat.status) {
      case "booked":
        return `${baseClass} bg-destructive/20 border-destructive/40 text-destructive cursor-not-allowed opacity-60`;
      case "selected":
        return `${baseClass} bg-primary border-primary text-primary-foreground shadow-lg scale-105 cursor-pointer hover:scale-110 active:scale-95`;
      case "available":
        const colors = getSeatTypeColors(seat.type);
        return `${baseClass} ${colors.bg} ${colors.border} ${colors.text} cursor-pointer ${colors.hover} hover:shadow-md active:scale-95`;
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
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-4">
            <div className="w-16 h-20 sm:w-20 sm:h-28 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              <Monitor className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">
                {showData.movie.title}
              </h2>
              <div className="space-y-1 mt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{showData.venue.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(showData.showtime.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{showData.showtime.time}</span>
                  </div>
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
          <div className="space-y-3 sm:space-y-4 overflow-x-auto px-2">
            {showData.screen.seatMap.rows.slice().reverse().map((rowData) => (
              <div
                key={rowData.row}
                className="flex items-center justify-center gap-2 sm:gap-3 min-w-max"
              >
                <div className="w-8 sm:w-10 text-center font-medium text-muted-foreground text-sm sm:text-base">
                  {rowData.row}
                </div>
                <div className="flex gap-1 sm:gap-1.5">
                  {rowData.seats.map((seatNumber) => {
                    const seat = seatData.find(
                      (s) => s.row === rowData.row && s.seat === seatNumber
                    )!;
                    return (
                      <Button
                        key={`${rowData.row}-${seatNumber}`}
                        variant="ghost"
                        size="sm"
                        className={`${getSeatButtonClass(seat)} w-10 h-10 sm:w-12 sm:h-12 p-0 text-sm sm:text-base font-semibold touch-manipulation active:scale-95`}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status === "booked"}
                      >
                        {seatNumber}
                      </Button>
                    );
                  })}
                </div>
                <div className="w-8 sm:w-10 text-center font-medium text-muted-foreground text-sm sm:text-base">
                  {rowData.row}
                </div>
              </div>
            ))}
          </div>

          {/* Seat Type Legend */}
          <div className="space-y-4 pt-4 sm:pt-6 border-t border-border">
            <h4 className="text-base font-semibold text-center text-foreground">Seat Types & Pricing</h4>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {["vip", "diamond", "platinum", "gold", "silver"].map((type) => {
                const colors = getSeatTypeColors(type);
                const price = showData.showtime.pricing[type as keyof typeof showData.showtime.pricing] || 0;
                const typeCount = seatData.filter(seat => seat.type === type && seat.status === "available").length;
                
                return (
                  <div key={type} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 ${colors.bg} ${colors.border} border-2 rounded-md flex-shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-base font-semibold capitalize text-foreground">{type}</div>
                      {isAdminUser && (
                        <div className="text-sm font-medium text-primary">AED {price}</div>
                      )}
                      <div className="text-xs text-muted-foreground">{typeCount} available</div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Status Legend */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 pt-2">
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
          </div>
        </CardContent>
      </Card>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Selected Seats</h3>
                <div className="text-right">
                  {isAdminUser && (
                    <p className="text-xl sm:text-2xl font-bold text-primary">
                      AED {totalPrice.toFixed(0)}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              {/* Selected Seats List */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedSeats.map((seat, index) => {
                    const colors = getSeatTypeColors(seat.type);
                    const seatPrice = seat.price || showData.showtime.pricing[seat.type];
                    
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50">
                        <div className={`w-4 h-4 ${colors.bg} ${colors.border} border rounded-sm flex-shrink-0`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">{seat.row}{seat.seat}</div>
                          <div className="text-xs text-muted-foreground capitalize">{seat.type}</div>
                        </div>
                        {isAdminUser && (
                          <div className="text-xs font-medium text-primary">AED {seatPrice}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Seat Types Summary */}
              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground">Summary by Type:</p>
                <div className="flex flex-wrap gap-2">
                  {["vip", "diamond", "platinum", "gold", "silver"].map((type) => {
                    const seatsOfType = selectedSeats.filter(seat => seat.type === type);
                    if (seatsOfType.length === 0) return null;
                    
                    const colors = getSeatTypeColors(type);
                    const typePrice = seatsOfType.reduce((sum, seat) => {
                      const seatPrice = seat.price || showData.showtime.pricing[seat.type];
                      return sum + seatPrice;
                    }, 0);
                    
                    return (
                      <div key={type} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/50">
                        <div className={`w-4 h-4 ${colors.bg} ${colors.border} border rounded-sm`}></div>
                        <span className="text-sm font-medium capitalize">{type}</span>
                        <span className="text-sm text-muted-foreground">
                          ({seatsOfType.length})
                        </span>
                        {isAdminUser && (
                          <span className="text-sm font-medium text-primary">
                            AED {typePrice.toFixed(0)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

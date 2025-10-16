"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Monitor, ZoomIn, ZoomOut } from "lucide-react";
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
  const [zoom, setZoom] = useState(1);
  const seatMapRef = useRef<HTMLDivElement>(null);
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const isPinchingRef = useRef(false);
  const baseZoomRef = useRef(1);
  const initialPinchDistanceRef = useRef(0);
  const { user } = useAuth();

  // Determine if user is admin/superadmin (can see pricing)
  const isAdminUser = user && (user.role === 'admin' || user.role === 'super-admin');

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.4));

  // Clamp helper
  const clampZoom = (value: number) => Math.min(2, Math.max(0.4, value));

  // Trackpad pinch / Ctrl+Wheel zoom support
  useEffect(() => {
    const container = seatMapRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      // Browser pinch-to-zoom on trackpads often sends wheel with ctrlKey=true
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY; // invert so natural pinch in zooms in
        const factor = delta > 0 ? 1.05 : 0.95;
        setZoom((prev) => clampZoom(prev * factor));
      }
    };

    // Add as non-passive to allow preventDefault
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel as any);
    };
  }, []);

  // Pointer-based pinch-zoom for touch
  useEffect(() => {
    const target = zoomContainerRef.current;
    if (!target) return;

    const activePointers = new Map<number, PointerEvent>();

    const getDistance = (a: PointerEvent, b: PointerEvent) => {
      const dx = a.clientX - b.clientX;
      const dy = a.clientY - b.clientY;
      return Math.hypot(dx, dy);
    };

    const onPointerDown = (e: PointerEvent) => {
      // Only engage for touch pointers
      if (e.pointerType !== 'touch') return;
      target.setPointerCapture?.(e.pointerId);
      activePointers.set(e.pointerId, e);
      if (activePointers.size === 2) {
        const [p1, p2] = Array.from(activePointers.values());
        initialPinchDistanceRef.current = getDistance(p1, p2);
        baseZoomRef.current = zoom;
        isPinchingRef.current = true;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      if (!activePointers.has(e.pointerId)) return;
      activePointers.set(e.pointerId, e);
      if (activePointers.size === 2 && isPinchingRef.current) {
        e.preventDefault();
        const [p1, p2] = Array.from(activePointers.values());
        const currentDistance = getDistance(p1, p2);
        if (initialPinchDistanceRef.current > 0) {
          const scale = currentDistance / initialPinchDistanceRef.current;
          const nextZoom = clampZoom(baseZoomRef.current * scale);
          setZoom(nextZoom);
        }
      }
    };

    const endPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      activePointers.delete(e.pointerId);
      if (activePointers.size < 2) {
        isPinchingRef.current = false;
        initialPinchDistanceRef.current = 0;
      }
    };

    target.addEventListener('pointerdown', onPointerDown);
    target.addEventListener('pointermove', onPointerMove);
    target.addEventListener('pointerup', endPointer);
    target.addEventListener('pointercancel', endPointer);
    target.addEventListener('pointerleave', endPointer);

    return () => {
      target.removeEventListener('pointerdown', onPointerDown);
      target.removeEventListener('pointermove', onPointerMove);
      target.removeEventListener('pointerup', endPointer);
      target.removeEventListener('pointercancel', endPointer);
      target.removeEventListener('pointerleave', endPointer);
    };
  }, [zoom]);

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

  // Unified styling for all available seats (no type-based colors)
  const availableSeatClass = "bg-slate-200 border-slate-400 text-slate-800 hover:bg-slate-300 hover:border-slate-500";

  const getSeatButtonClass = (seat: SeatData) => {
    const baseClass =
      "text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 border-2 shadow-sm";

    switch (seat.status) {
      case "booked":
        return `${baseClass} bg-red-600 border-red-900 text-white cursor-not-allowed`;
      case "selected":
        return `${baseClass} bg-primary border-primary text-primary-foreground shadow-lg scale-105 cursor-pointer hover:scale-110 active:scale-95`;
      case "available":
        return `${baseClass} ${availableSeatClass} cursor-pointer hover:shadow-md active:scale-95`;
      default:
        return baseClass;
    }
  };

  const seatData = createSeatData();
  const reversedRows = showData.screen.seatMap.rows.slice().reverse();
  const totalPrice = selectedSeats.reduce((total, seat) => {
    // Use individual seat price if available, fallback to category pricing
    const seatPrice = seat.price || showData.showtime.pricing[seat.type];
    return total + seatPrice;
  }, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header - Movie Info */}
      <div className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
        <div className="p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-16 md:w-16 md:h-20 bg-muted rounded flex items-center justify-center flex-shrink-0">
              <Monitor className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base md:text-lg font-bold text-foreground truncate">
                {showData.movie.title}
              </h2>
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="truncate">{showData.venue.name}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(showData.showtime.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{showData.showtime.time}</span>
                </div>
                <Badge variant="outline" className="text-xs">{showData.screen.name}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Seat Map */}
      <div className="flex-1 overflow-auto bg-background">
        <div className="space-y-6">
          {/* Zoom Controls */}
          <div className="flex justify-end gap-2 px-4 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.4}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 2}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoomable Seat Grid with Sticky Row Letters - No horizontal padding */}
          <div className="relative px-0">

            {/* Scrollable Seat Container */
            }
            <div className="overflow-x-auto pb-4" ref={seatMapRef}>
              <div
                ref={zoomContainerRef}
                className="space-y-3 sm:space-y-4 inline-block w-max px-4 sm:px-6 select-none"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center top',
                  transition: 'transform 0.2s ease-out',
                  // Enable custom pinch handling without browser gestures while pinching
                  touchAction: isPinchingRef.current ? 'none' as any : 'manipulation'
                }}
              >
                {/* Screen (now part of zoomable container) */}
                <div className="flex justify-center">
                  <div className="w-3/4 h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full opacity-60"></div>
                </div>
                <div className="text-center text-sm text-muted-foreground font-medium">
                  SCREEN
                </div>

                {reversedRows.map((rowData, idx) => {
                  const prevType = idx > 0 ? reversedRows[idx - 1].type : rowData.type;
                  const isNewCategory = idx === 0 || rowData.type !== prevType;
                  const typeLabel = rowData.type;
                  const typePrice = showData.showtime.pricing[typeLabel as keyof typeof showData.showtime.pricing] || 0;
                  return (
                    <div key={rowData.row} className="flex flex-col">
                      {isNewCategory && (
                        <div className="flex items-center gap-3 w-full h-8 sm:h-10 my-1">
                          <div className="flex-1 h-px bg-border/80 dark:bg-white/20" />
                          <div className="px-2 py-0.5 rounded-full border border-border/70 bg-background/80 text-[10px] sm:text-xs capitalize text-foreground">
                            {typeLabel}
                            {isAdminUser && <span className="ml-2 text-muted-foreground">AED {typePrice}</span>}
                          </div>
                          <div className="flex-1 h-px bg-border/80 dark:bg-white/20" />
                        </div>
                      )}
                      <div className={`flex items-center gap-2 sm:gap-3`}>
                        <div className="w-6 sm:w-8 h-10 sm:h-12 flex items-center justify-center font-medium text-muted-foreground text-xs sm:text-sm">
                          {rowData.row}
                        </div>
                        <div className="flex items-center justify-center gap-1 sm:gap-1.5">
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
                        <div className="w-6 sm:w-8 h-10 sm:h-12 flex items-center justify-center font-medium text-muted-foreground text-xs sm:text-sm">
                          {rowData.row}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer - Seat Legend */}
      <div className="sticky bottom-0 z-10 bg-background border-t border-border shadow-lg">
        <div className="p-3 md:p-4">
          {/* Seat Type Legend removed to avoid color confusion */}

          {/* Status Legend */}
          <div className="flex justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-primary border-2 border-primary rounded"></div>
              <span className="text-muted-foreground">Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-destructive/20 border-2 border-destructive/40 rounded"></div>
              <span className="text-muted-foreground">Booked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const startScrollTopRef = useRef(0);
  const dragIntentDecidedRef = useRef(false);
  const didInitialCenterRef = useRef(false);
  const { user } = useAuth();

  // Determine if user is admin/superadmin (can see pricing)
  const isAdminUser = user && (user.role === 'admin' || user.role === 'super-admin');

  const MAX_ZOOM = 4; // wider range for faster perceived zoom-in
  const MIN_ZOOM = 0.2; // allow smaller min
  const DEFAULT_ZOOM = 0.35; // starting zoom level (tweak as desired)
  const PINCH_SENSITIVITY_IN = 10.0; // very strong zoom-in response
  const PINCH_SENSITIVITY_OUT = 10.0; // keep zoom-out controlled
  const WHEEL_STEP_IN = 1.6; // faster zoom-in per wheel event
  const WHEEL_STEP_OUT = 0.85; // controlled zoom-out per wheel event

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, MAX_ZOOM));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, MIN_ZOOM));

  // Clamp helper
  const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

  // Set default zoom on mount
  useEffect(() => {
    setZoom(clampZoom(DEFAULT_ZOOM));
  }, []);

  // After initial zoom set, center horizontally at the top
  useEffect(() => {
    if (didInitialCenterRef.current) return;
    const container = seatMapRef.current;
    if (!container) return;
    requestAnimationFrame(() => {
      const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
      container.scrollLeft = Math.floor(maxScrollLeft / 2);
      container.scrollTop = 0;
      didInitialCenterRef.current = true;
    });
  }, [zoom]);

  // Trackpad pinch / Ctrl+Wheel zoom support
  useEffect(() => {
    const container = seatMapRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      // Browser pinch-to-zoom on trackpads often sends wheel with ctrlKey=true
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY; // invert so natural pinch in zooms in
        const factor = delta > 0 ? WHEEL_STEP_IN : WHEEL_STEP_OUT;
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
      activePointers.set(e.pointerId, e);
      if (activePointers.size === 1) {
        const container = seatMapRef.current;
        if (container) {
          isDraggingRef.current = true;
          dragStartXRef.current = e.clientX;
          dragStartYRef.current = e.clientY;
          startScrollLeftRef.current = container.scrollLeft;
          startScrollTopRef.current = container.scrollTop;
          dragIntentDecidedRef.current = false;
        }
      }
      if (activePointers.size === 2) {
        const [p1, p2] = Array.from(activePointers.values());
        initialPinchDistanceRef.current = getDistance(p1, p2);
        baseZoomRef.current = zoom;
        isPinchingRef.current = true;
        isDraggingRef.current = false;
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
          const rawScale = currentDistance / initialPinchDistanceRef.current;
          // Apply asymmetric sensitivity: faster in, controlled out
          const effectiveScale = rawScale >= 1
            ? 1 + (rawScale - 1) * PINCH_SENSITIVITY_IN
            : 1 - (1 - rawScale) * PINCH_SENSITIVITY_OUT;
          const nextZoom = clampZoom(baseZoomRef.current * effectiveScale);
          setZoom(nextZoom);
        }
      } else if (activePointers.size === 1 && isDraggingRef.current) {
        const container = seatMapRef.current;
        if (!container) return;
        const dx = e.clientX - dragStartXRef.current;
        const dy = e.clientY - dragStartYRef.current;
        if (!dragIntentDecidedRef.current) {
          const threshold = 6;
          if (Math.abs(dx) > Math.abs(dy) + threshold) {
            dragIntentDecidedRef.current = true; // horizontal pan
          } else if (Math.abs(dy) > Math.abs(dx) + threshold) {
            dragIntentDecidedRef.current = true;
            isDraggingRef.current = false; // let native vertical scroll handle
            return;
          } else {
            return;
          }
        }
        if (dragIntentDecidedRef.current && isDraggingRef.current) {
          e.preventDefault();
          container.scrollLeft = startScrollLeftRef.current - dx;
          container.scrollTop = startScrollTopRef.current - dy;
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
      if (activePointers.size === 0) {
        isDraggingRef.current = false;
      }
    };

    // Double-tap to zoom in by a step
    let lastTapTime = 0;
    const onTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (e.touches.length === 0) {
        if (now - lastTapTime < 300) {
          setZoom((prev) => clampZoom(prev * 1.8));
          lastTapTime = 0;
        } else {
          lastTapTime = now;
        }
      }
    };

    target.addEventListener('pointerdown', onPointerDown as any, { passive: false, capture: true } as any);
    target.addEventListener('pointermove', onPointerMove as any, { passive: false, capture: true } as any);
    target.addEventListener('pointerup', endPointer as any, { passive: false, capture: true } as any);
    target.addEventListener('pointercancel', endPointer as any, { passive: false, capture: true } as any);
    target.addEventListener('pointerleave', endPointer as any, { passive: false, capture: true } as any);
    target.addEventListener('touchend', onTouchEnd as any, { passive: true } as any);

    return () => {
      target.removeEventListener('pointerdown', onPointerDown as any, true);
      target.removeEventListener('pointermove', onPointerMove as any, true);
      target.removeEventListener('pointerup', endPointer as any, true);
      target.removeEventListener('pointercancel', endPointer as any, true);
      target.removeEventListener('pointerleave', endPointer as any, true);
      target.removeEventListener('touchend', onTouchEnd as any);
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
    if (isPinchingRef.current || isDraggingRef.current) return;
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
        return `${baseClass} bg-primary border-primary text-primary-foreground shadow-lg cursor-pointer`;
      case "available":
        return `${baseClass} ${availableSeatClass} cursor-pointer hover:shadow-md`;
      default:
        return baseClass;
    }
  };

  const seatData = createSeatData();
  // Get the rows in the order they are in the seat map
  // const reversedRows = showData.screen.seatMap.rows.slice().reverse();

  const rows = showData.screen.seatMap.rows.slice();
  // Calculate max seats per row for centering
  const maxSeatsPerRow = Math.max(...rows.map(row => row.seats.length));
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
              disabled={zoom <= MIN_ZOOM}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
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
                  transition: 'transform 80ms linear',
                  // Allow native vertical scrolling while we handle horizontal pans/pinch
                  touchAction: 'pan-y' as any
                }}
              >
                {/* Screen (now part of zoomable container) */}
                <div className="flex justify-center">
                  <div className="w-3/4 h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full opacity-60"></div>
                </div>
                <div className="text-center text-sm text-muted-foreground font-medium">
                  SCREEN
                </div>


                {/* row order from the seat map */}
                {/* {reversedRows.map((rowData, idx) => {
                  const prevType = idx > 0 ? reversedRows[idx - 1].type : rowData.type; */}

                {rows.map((rowData, idx) => {
                  const prevType = idx > 0 ? rows[idx - 1].type : rowData.type;
                  const isNewCategory = idx === 0 || rowData.type !== prevType;
                  const typeLabel = rowData.type;
                  const typePrice = showData.showtime.pricing[typeLabel as keyof typeof showData.showtime.pricing] || 0;
                  return (
                    <div key={rowData.row} className="flex flex-col">
                      {isNewCategory && (
                        <div className="flex items-center gap-4 w-full h-9 sm:h-12 my-2">
                          <div className="flex-1 h-[2px] bg-border/90 dark:bg-white/30" />
                          <div className="px-3 py-1 rounded-full border border-border bg-background/90 shadow-sm text-[11px] sm:text-sm uppercase font-semibold tracking-wide text-foreground">
                            {typeLabel}
                            {isAdminUser && <span className="ml-2 text-muted-foreground normal-case font-normal">AED {typePrice}</span>}
                          </div>
                          <div className="flex-1 h-[2px] bg-border/90 dark:bg-white/30" />
                        </div>
                      )}
                      <div className={`flex items-center gap-2 sm:gap-3 w-full`}>
                        <div className="w-6 sm:w-8 h-10 sm:h-12 flex items-center justify-center font-medium text-muted-foreground text-xs sm:text-sm flex-shrink-0">
                          {rowData.row}
                        </div>
                        <div className="flex-1 flex justify-center">
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
                                  className={`${getSeatButtonClass(seat)} w-10 h-10 sm:w-12 sm:h-12 p-0 text-sm sm:text-base font-semibold`}
                                  onClick={() => handleSeatClick(seat)}
                                  disabled={seat.status === "booked"}
                                >
                                  {seatNumber}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="w-6 sm:w-8 h-10 sm:h-12 flex items-center justify-center font-medium text-muted-foreground text-xs sm:text-sm flex-shrink-0">
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

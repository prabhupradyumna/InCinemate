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
  const [minZoom, setMinZoom] = useState(0.3); // Will be calculated dynamically
  const [isPinching, setIsPinching] = useState(false); // Track pinch state for smooth transitions
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
  const didCalculateMinZoomRef = useRef(false);
  const { user } = useAuth();

  // Determine if user is admin/superadmin (can see pricing)
  const isAdminUser = user && (user.role === 'admin' || user.role === 'super-admin');

  const MAX_ZOOM = 2.5; // Maximum zoom for detailed seat selection
  const PINCH_SENSITIVITY = 0.5; // Smooth pinch sensitivity (lower = smoother)
  const WHEEL_STEP = 0.1; // Smooth wheel zoom step

  // Calculate minimum zoom to fit entire theater
  const calculateMinZoom = () => {
    const container = seatMapRef.current;
    const content = zoomContainerRef.current;
    if (!container || !content) return 0.3;

    // Get container dimensions (visible area)
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Get content dimensions (actual seat map size)
    const contentWidth = content.scrollWidth;
    const contentHeight = content.scrollHeight;

    // Calculate zoom needed to fit content in container
    // Add small padding (10px) to ensure content fits comfortably
    const padding = 20;
    const scaleX = (containerWidth - padding) / contentWidth;
    const scaleY = (containerHeight - padding) / contentHeight;
    
    // Use the smaller scale to ensure everything fits
    const calculatedMinZoom = Math.min(scaleX, scaleY, 0.3); // Cap at 0.3 minimum
    
    // Ensure minimum zoom is reasonable (not too small)
    return Math.max(calculatedMinZoom, 0.2);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, MAX_ZOOM));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, minZoom));

  // Clamp helper with dynamic min zoom
  const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(minZoom, value));

  // Calculate and set minimum zoom when content is ready
  useEffect(() => {
    const calculateAndSetMinZoom = () => {
      const calculated = calculateMinZoom();
      if (calculated > 0 && !didCalculateMinZoomRef.current) {
        setMinZoom(calculated);
        // Set initial zoom to fit the theater
        setZoom(calculated);
        didCalculateMinZoomRef.current = true;
      }
    };

    // Calculate after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(calculateAndSetMinZoom, 100);
    
    // Also calculate on window resize
    let resizeTimeoutId: NodeJS.Timeout | null = null;
    const handleResize = () => {
      if (resizeTimeoutId) clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(() => {
        const calculated = calculateMinZoom();
        if (calculated > 0) {
          setMinZoom(calculated);
          // Adjust current zoom if it's below new minimum
          setZoom((prev) => Math.max(prev, calculated));
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    
    // Use ResizeObserver to detect container size changes (important for mobile)
    const container = seatMapRef.current;
    let resizeObserver: ResizeObserver | null = null;
    
    if (container && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
    }
    
    return () => {
      clearTimeout(timeoutId);
      if (resizeTimeoutId) clearTimeout(resizeTimeoutId);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [showData.screen.seatMap.rows]);

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
  }, [zoom, minZoom]);

  // Trackpad pinch / Ctrl+Wheel zoom support
  useEffect(() => {
    const container = seatMapRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      // Browser pinch-to-zoom on trackpads often sends wheel with ctrlKey=true
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY; // invert so natural pinch in zooms in
        const zoomDelta = delta > 0 ? WHEEL_STEP : -WHEEL_STEP;
        setZoom((prev) => clampZoom(prev + zoomDelta));
      }
    };

    // Add as non-passive to allow preventDefault
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel as any);
    };
  }, [minZoom]);

  // Pointer-based pinch-zoom for touch (improved mobile support)
  useEffect(() => {
    const target = zoomContainerRef.current;
    const container = seatMapRef.current;
    if (!target || !container) return;

    const activePointers = new Map<number, PointerEvent>();

    const getDistance = (a: PointerEvent, b: PointerEvent) => {
      const dx = a.clientX - b.clientX;
      const dy = a.clientY - b.clientY;
      return Math.hypot(dx, dy);
    };

    const onPointerDown = (e: PointerEvent) => {
      // Only engage for touch pointers
      if (e.pointerType !== 'touch') return;
      e.preventDefault(); // Prevent default touch behavior
      activePointers.set(e.pointerId, e);
      
      if (activePointers.size === 1) {
        // Single touch - prepare for drag
        isDraggingRef.current = true;
        dragStartXRef.current = e.clientX;
        dragStartYRef.current = e.clientY;
        startScrollLeftRef.current = container.scrollLeft;
        startScrollTopRef.current = container.scrollTop;
        dragIntentDecidedRef.current = false;
      }
      
      if (activePointers.size === 2) {
        // Two touches - start pinch zoom
        const [p1, p2] = Array.from(activePointers.values());
        initialPinchDistanceRef.current = getDistance(p1, p2);
        baseZoomRef.current = zoom;
        isPinchingRef.current = true;
        setIsPinching(true);
        isDraggingRef.current = false;
        dragIntentDecidedRef.current = false;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      if (!activePointers.has(e.pointerId)) return;
      
      activePointers.set(e.pointerId, e);
      
      if (activePointers.size === 2 && isPinchingRef.current) {
        // Pinch zoom gesture
        e.preventDefault();
        const [p1, p2] = Array.from(activePointers.values());
        const currentDistance = getDistance(p1, p2);
        
        if (initialPinchDistanceRef.current > 0) {
          // Calculate scale factor
          const scale = currentDistance / initialPinchDistanceRef.current;
          
          // Apply smooth sensitivity
          const zoomChange = (scale - 1) * PINCH_SENSITIVITY;
          const nextZoom = clampZoom(baseZoomRef.current + zoomChange);
          
          setZoom(nextZoom);
        }
      } else if (activePointers.size === 1 && isDraggingRef.current && !isPinchingRef.current) {
        // Single touch drag/pan
        const dx = e.clientX - dragStartXRef.current;
        const dy = e.clientY - dragStartYRef.current;
        
        if (!dragIntentDecidedRef.current) {
          // Determine drag intent (horizontal vs vertical)
          const threshold = 8;
          if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
            dragIntentDecidedRef.current = true;
            // If primarily vertical, let native scroll handle it
            if (Math.abs(dy) > Math.abs(dx) + threshold) {
              isDraggingRef.current = false;
              return;
            }
          } else {
            return; // Wait for clear drag intent
          }
        }
        
        if (dragIntentDecidedRef.current && isDraggingRef.current) {
          e.preventDefault();
          // Pan the container
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
        setIsPinching(false);
        initialPinchDistanceRef.current = 0;
      }
      
      if (activePointers.size === 0) {
        isDraggingRef.current = false;
        dragIntentDecidedRef.current = false;
      } else if (activePointers.size === 1) {
        // Reset drag state when going from 2 touches to 1
        isDraggingRef.current = true;
        const remainingPointer = Array.from(activePointers.values())[0];
        dragStartXRef.current = remainingPointer.clientX;
        dragStartYRef.current = remainingPointer.clientY;
        startScrollLeftRef.current = container.scrollLeft;
        startScrollTopRef.current = container.scrollTop;
        dragIntentDecidedRef.current = false;
      }
    };

    // Double-tap to zoom in by a step
    let lastTapTime = 0;
    let lastTapX = 0;
    let lastTapY = 0;
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0 && e.changedTouches.length === 1) {
        const now = Date.now();
        const touch = e.changedTouches[0];
        const tapX = touch.clientX;
        const tapY = touch.clientY;
        
        // Check if it's a double tap (within 300ms and 50px distance)
        const timeDiff = now - lastTapTime;
        const distance = Math.hypot(tapX - lastTapX, tapY - lastTapY);
        
        if (timeDiff < 300 && distance < 50 && !isPinchingRef.current) {
          // Double tap detected - zoom in
          setZoom((prev) => {
            const newZoom = prev < MAX_ZOOM ? Math.min(prev * 1.5, MAX_ZOOM) : minZoom;
            return clampZoom(newZoom);
          });
          lastTapTime = 0;
        } else {
          lastTapTime = now;
          lastTapX = tapX;
          lastTapY = tapY;
        }
      }
    };

    // Use capture phase and non-passive for better mobile control
    const options = { passive: false, capture: true };
    
    target.addEventListener('pointerdown', onPointerDown as any, options);
    target.addEventListener('pointermove', onPointerMove as any, options);
    target.addEventListener('pointerup', endPointer as any, options);
    target.addEventListener('pointercancel', endPointer as any, options);
    container.addEventListener('touchend', onTouchEnd as any, { passive: true });

    return () => {
      target.removeEventListener('pointerdown', onPointerDown as any, true);
      target.removeEventListener('pointermove', onPointerMove as any, true);
      target.removeEventListener('pointerup', endPointer as any, true);
      target.removeEventListener('pointercancel', endPointer as any, true);
      container.removeEventListener('touchend', onTouchEnd as any);
    };
  }, [zoom, minZoom]);

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
  // Get the rows in descending order from the screen (farthest rows first)
  const rows = showData.screen.seatMap.rows.slice().reverse();
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
      <div className="flex-1 overflow-auto bg-background relative">
        {/* Fixed Zoom Controls */}
        <div className="sticky top-4 right-4 z-20 flex justify-end gap-2 px-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= minZoom}
            className="h-8 w-8 p-0 bg-background/95 backdrop-blur-sm"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="h-8 w-8 p-0 bg-background/95 backdrop-blur-sm"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Zoomable Seat Grid with Sticky Row Letters - No horizontal padding */}
          <div className="relative px-0">

            {/* Scrollable Seat Container */}
            <div 
              className="overflow-x-auto overflow-y-auto pb-4" 
              ref={seatMapRef}
              style={{
                // Ensure touch events work properly on mobile
                touchAction: 'pan-x pan-y pinch-zoom' as any,
                WebkitOverflowScrolling: 'touch' as any
              }}
            >
              <div
                ref={zoomContainerRef}
                className="space-y-3 sm:space-y-4 inline-block select-none"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center top',
                  transition: isPinching ? 'none' : 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                  // Allow pinch-zoom and pan
                  touchAction: 'pan-x pan-y pinch-zoom' as any,
                  width: 'max-content',
                  maxWidth: '100%',
                  padding: '0 1rem'
                }}
              >
                {/* Screen (now part of zoomable container) - Match row structure */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 sm:w-8 flex-shrink-0"></div>
                  <div className="flex justify-center" style={{ 
                    width: `${maxSeatsPerRow * 48 + 16}px`,
                    minWidth: `${maxSeatsPerRow * 48 + 16}px`
                  }}>
                    <div className="h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full opacity-60" style={{ 
                      width: `${maxSeatsPerRow * 48 + 16}px`,
                      minWidth: '200px',
                      maxWidth: '600px'
                    }}></div>
                  </div>
                  <div className="w-6 sm:w-8 flex-shrink-0"></div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 sm:w-8 flex-shrink-0"></div>
                  <div className="text-center text-sm text-muted-foreground font-medium" style={{ 
                    width: `${maxSeatsPerRow * 48 + 16}px`,
                    minWidth: `${maxSeatsPerRow * 48 + 16}px`
                  }}>
                    SCREEN
                  </div>
                  <div className="w-6 sm:w-8 flex-shrink-0"></div>
                </div>


                {/* Rows in descending order from screen (farthest first) */}
                {rows.map((rowData, idx) => {
                  const prevType = idx > 0 ? rows[idx - 1].type : rowData.type;
                  const isNewCategory = idx === 0 || rowData.type !== prevType;
                  const typeLabel = rowData.type;
                  const typePrice = showData.showtime.pricing[typeLabel as keyof typeof showData.showtime.pricing] || 0;
                  return (
                    <div key={rowData.row} className="flex flex-col">
                      {isNewCategory && (
                        <div className="flex items-center gap-2 sm:gap-3 h-9 sm:h-12 my-2">
                          <div className="w-6 sm:w-8 flex-shrink-0"></div>
                          <div className="flex items-center gap-4 justify-center" style={{ 
                            width: `${maxSeatsPerRow * 48 + 16}px`,
                            minWidth: `${maxSeatsPerRow * 48 + 16}px`
                          }}>
                            <div className="flex-1 h-[2px] bg-border/90 dark:bg-white/30 min-w-[20px]" />
                            <div className="px-3 py-1 rounded-full border border-border bg-background/90 shadow-sm text-[11px] sm:text-sm uppercase font-semibold tracking-wide text-foreground whitespace-nowrap flex-shrink-0">
                              {typeLabel}
                              {isAdminUser && <span className="ml-2 text-muted-foreground normal-case font-normal">Rs {typePrice}</span>}
                            </div>
                            <div className="flex-1 h-[2px] bg-border/90 dark:bg-white/30 min-w-[20px]" />
                          </div>
                          <div className="w-6 sm:w-8 flex-shrink-0"></div>
                        </div>
                      )}
                      <div className={`flex items-center gap-2 sm:gap-3`}>
                        <div className="w-6 sm:w-8 h-10 sm:h-12 flex items-center justify-center font-medium text-muted-foreground text-xs sm:text-sm flex-shrink-0">
                          {rowData.row}
                        </div>
                        <div className="flex justify-center" style={{ 
                          width: `${maxSeatsPerRow * 48 + 16}px`,
                          minWidth: `${maxSeatsPerRow * 48 + 16}px`
                        }}>
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
                                  className={`${getSeatButtonClass(seat)} w-10 h-10 sm:w-12 sm:h-12 p-0 text-sm sm:text-base font-semibold flex-shrink-0`}
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

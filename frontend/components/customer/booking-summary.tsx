"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, CreditCard, User, Lock, AlertCircle, RefreshCw } from "lucide-react";
// useAuth removed - using simplified booking flow without authentication
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
// CustomerDetailsModal removed - using simplified booking flow without OTP
import { TermsConditionsPopup } from "@/components/customer/terms-conditions-popup";
import { CancelTransactionPopup } from "@/components/customer/cancel-transaction-popup";
// Payment-related imports removed - using simplified booking flow

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

interface BookingSummaryProps {
  showId: string;
  showData: ShowData;
  selectedSeats?: Array<{
    id: string;
    row: string;
    seat: number;
    type: "premium" | "regular";
    price?: number; // Individual seat price
  }>;
  selectedQuantity?: number;
  onBack?: () => void;
  onBookingCreated?: (bookingId: string) => void;
  onBookingCancelled?: () => void;
}

interface BookingDetails {
  booking_id: string;
  booking_reference: string;
  hold_id: string;
  hold_expires_at: string;
  subtotal: number;
  total_price: number;
}

export function BookingSummary({
  showId,
  showData,
  selectedSeats = [],
  selectedQuantity = 1,
  onBack,
  onBookingCreated,
  onBookingCancelled,
}: BookingSummaryProps) {
  // Simplified booking flow - no payment gateway or authentication required
  const router = useRouter();

  // New flow states
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  // Customer modal removed - using simplified booking flow without OTP
  // Payment gateway modal removed - using simplified booking flow
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
    null
  );
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHoldingSeats, setIsHoldingSeats] = useState(false);
  // Payment gateway selection removed - using simplified booking flow

  const [customerDetails, setCustomerDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  // Payment details removed - using simplified booking flow

  // Use actual selected seats or create mock based on quantity
  const mockSelectedSeats =
    selectedSeats.length > 0
      ? selectedSeats
      : Array.from({ length: selectedQuantity }, (_, i) => ({
          row: "A",
          seat: i + 1,
          type: "premium" as const,
        }));

  const subtotal = mockSelectedSeats.reduce((total, seat) => {
    // Use individual seat price if available, fallback to category pricing
    const seatPrice =
      (seat as any).price || showData.showtime.pricing[seat.type];
    return total + seatPrice;
  }, 0);

  const total = subtotal;

  // No timer needed - seats are released immediately on cancel

  // Handle browser back button and navigation
  useEffect(() => {
    if (!bookingDetails) return;

    console.log(
      "Setting up browser back button handler for booking:",
      bookingDetails.booking_id
    );
    let isNavigating = false;

    const handlePopState = (event: PopStateEvent) => {
      console.log(
        "Browser back button clicked, bookingDetails:",
        bookingDetails
      );
      if (bookingDetails && !isNavigating) {
        isNavigating = true;
        console.log("Showing cancel popup for browser back button");
        // Show cancel popup
        setShowCancelPopup(true);
        // Push the state back to prevent navigation
        window.history.pushState(
          { bookingActive: true },
          "",
          window.location.href
        );
        isNavigating = false;
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (bookingDetails) {
        // Show browser's default confirmation dialog
        event.preventDefault();
        event.returnValue =
          "You have an active booking. Are you sure you want to leave?";
        return "You have an active booking. Are you sure you want to leave?";
      }
    };

    // Push a state when booking is active to intercept back button
    window.history.pushState({ bookingActive: true }, "", window.location.href);

    // Add event listeners
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [bookingDetails]);

  // New BookMyShow-style flow handlers
  const handlePayNow = () => {
    setShowTermsPopup(true);
  };

  const handleAcceptTerms = async () => {
    setShowTermsPopup(false);

    // Always proceed to hold seats and redirect to simplified booking page
    // No authentication required for simplified booking flow
    await holdSeats();
    // After seats are held, redirect to simplified booking page
    if (bookingDetails) {
      router.push(`/booking/simple?booking_id=${bookingDetails.booking_id}`);
    }
  };

  // Customer details submit function removed - using simplified booking flow without OTP

  const handleBackFromTerms = () => {
    setShowTermsPopup(false);
  };

  // Payment gateway selection function removed - using simplified booking flow

  // Payment gateway functions removed - using simplified booking flow

  const handleCancelTransaction = () => {
    setShowCancelPopup(true);
  };

  const handleConfirmCancel = async () => {
    setShowCancelPopup(false);

    // Release seat hold if exists
    if (bookingDetails?.booking_id) {
      try {
        const { releaseSeatHold } = await import("@/lib/api");
        await releaseSeatHold({ booking_id: bookingDetails.booking_id });
        console.log(
          "Released seat hold for booking:",
          bookingDetails.booking_id
        );
      } catch (error) {
        console.error("Failed to release seat hold:", error);
      }
    }

    // Reset state
    setBookingDetails(null);
    setBookingError(null);

    // Notify parent component that booking was cancelled
    if (onBookingCancelled) {
      onBookingCancelled();
    }

    // Go back to seat selection
    if (onBack) {
      onBack();
    }
  };

  const handleCancelCancel = () => {
    setShowCancelPopup(false);
  };

  const holdSeats = async () => {
    if (selectedSeats.length === 0) return;

    setIsHoldingSeats(true);
    setBookingError(null);

    try {
      const { holdSeats } = await import("@/lib/api");
      // Map to backend seat ids, falling back to row-seat mapping from showData
      const seatIdMap: Record<string, string> =
        (showData as any).seatIdMap || {};
      const seatIds = selectedSeats
        .map((s) => s.id || seatIdMap[`${s.row}-${s.seat}`])
        .filter(Boolean);

      const res = await holdSeats({
        show_id: showId,
        seat_ids: seatIds as string[],
      });

      setBookingDetails(res.data);

      // Notify parent component that a booking was created
      if (onBookingCreated) {
        onBookingCreated(res.data.booking_id);
      }
    } catch (e: any) {
      setBookingError(
        e?.response?.data?.error || e?.message || "Failed to hold seats"
      );
    } finally {
      setIsHoldingSeats(false);
    }
  };

  // PhonePe payment function removed - using simplified booking flow
  const handleCompleteBooking = async () => {
    if (!bookingDetails) return;
    setIsProcessing(true);
    try {
      const { confirmBooking } = await import("@/lib/api");
      // Payment confirmation removed - using simplified booking flow
      router.push(
        `/booking/confirmation?booking_id=${bookingDetails.booking_id}`
      );
    } catch (e: any) {
      setBookingError(
        e?.response?.data?.error || e?.message || "Failed to confirm booking"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const isDetailsValid = customerDetails.fullName && !!customerDetails.phone;

  // Payment validation removed - using simplified booking flow

  // OTP authentication removed - using simplified booking flow

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <Card className="bg-card border-border sticky top-24">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base md:text-lg">
            <span>Booking Summary</span>
            <Badge variant="outline" className="text-xs">
              {bookingDetails ? "Payment" : "Summary"}
            </Badge>
          </CardTitle>
        </CardHeader>

        {bookingError && (
          <div className="px-6 pb-4">
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3">
              <p className="font-bold mb-1">Booking Error</p>
              <p>{bookingError}</p>
            </div>
          </div>
        )}

        <CardContent className="space-y-3 md:space-y-4">
          {/* Movie Details */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm md:text-base">
              {showData.movie.title}
            </h3>
            <div className="space-y-1 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span>{showData.venue.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(showData.showtime.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>{showData.showtime.time}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Selected Seats */}
          {mockSelectedSeats.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm md:text-base">
                Selected Seats
              </h4>
              <div className="space-y-1">
                {mockSelectedSeats.map((seat, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-xs md:text-sm"
                  >
                    <span>
                      {seat.row}
                      {seat.seat} ({seat.type})
                    </span>
                    <span>
                      ₹
                      {(
                        (seat as any).price ||
                        showData.showtime.pricing[seat.type]
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Price Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs md:text-sm">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-sm md:text-base">
              <span>Total</span>
              <span className="text-primary">
                {isHoldingSeats
                  ? "Calculating..."
                  : `₹${(bookingDetails?.total_price || total).toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            {/* Show Pay Now button when seats are selected but not held */}
            {!bookingDetails && mockSelectedSeats.length > 0 && (
              <>
                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  onClick={handlePayNow}
                  disabled={isHoldingSeats || !!bookingError}
                >
                  {isHoldingSeats
                    ? "Processing..."
                    : `Pay ₹${total.toFixed(0)}`}
                </Button>
                {onBack && (
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={onBack}
                  >
                    Back to Seat Selection
                  </Button>
                )}
              </>
            )}

            {/* Show payment processing when seats are held */}
            {bookingDetails && (
              <>
                <Separator />

                {/* Payment Processing */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2 text-sm md:text-base">
                    <CreditCard className="h-4 w-4" />
                    Payment Processing
                  </h4>

                  {isProcessing ? (
                    <div className="text-center py-8">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="text-sm text-muted-foreground">
                          Processing Payment...
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Please wait while we process your payment through
                        PhonePe
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-lg p-4 mb-4">
                        <p className="font-medium mb-1">
                          Seats Reserved Successfully!
                        </p>
                        <p>Your seats have been held for 10 minutes</p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">
                        Payment gateway selection will appear automatically
                      </p>
                    </div>
                  )}

                  {/* Simplified booking status */}
                  {isProcessing && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">Processing booking...</p>
                    </div>
                  )}

                  {/* Booking Error Display */}
                  {bookingError && !isProcessing && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">{bookingError}</p>
                      <Button 
                        onClick={() => setBookingError(null)}
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}

                  {/* PhonePe Script Error removed - using simplified booking flow */}

                  {/* Security Notice */}
                  <div className="flex items-start gap-2 p-3 bg-muted/20 rounded-lg border border-border/30">
                    <Lock className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">
                        Secure Payment
                      </p>
                      <p>Your payment information is encrypted and secure.</p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={handleCancelTransaction}
                  disabled={isProcessing}
                >
                  Cancel Transaction
                </Button>

                {/* Back button for payment step - shows cancel popup */}
                {onBack && (
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={handleCancelTransaction}
                    disabled={isProcessing}
                  >
                    Back to Seat Selection
                  </Button>
                )}
              </>
            )}

            {mockSelectedSeats.length === 0 && (
              <Button className="w-full" disabled>
                Select seats to continue
              </Button>
            )}
          </div>

          {/* Terms Notice */}
          {bookingDetails && (
            <div className="text-xs text-muted-foreground text-center pt-2">
              By completing this booking, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Details Modal removed - using simplified booking flow without OTP */}

      {/* Terms & Conditions Popup */}
      <TermsConditionsPopup
        isOpen={showTermsPopup}
        onClose={handleBackFromTerms}
        onAccept={handleAcceptTerms}
        movieTitle={showData.movie.title}
        showTime={`${formatDate(showData.showtime.date)} ${showData.showtime.time}`}
        venue={showData.venue.name}
        totalAmount={total}
      />

      {/* Cancel Transaction Popup */}
      <CancelTransactionPopup
        isOpen={showCancelPopup}
        onClose={handleCancelCancel}
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelCancel}
      />

      {/* Payment Gateway Modal removed - using simplified booking flow */}
    </div>
  );
}

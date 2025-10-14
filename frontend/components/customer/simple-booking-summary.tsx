"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, User, Phone, Mail, CheckCircle, AlertCircle, Clock as ClockIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
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
}

interface BookingDetails {
  booking_id: string;
  booking_reference: string;
  seats: Array<{
    id: string;
    row: string;
    number: number;
    category: "vip" | "diamond" | "platinum" | "gold" | "silver";
    price: number;
  }>;
  subtotal: number;
  total_price: number;
  hold_expires_at: string;
}

interface SimpleBookingSummaryProps {
  showData: ShowData;
  bookingDetails: BookingDetails;
  onBookingComplete?: (bookingId: string) => void;
}

export function SimpleBookingSummary({
  showData,
  bookingDetails,
  onBookingComplete,
}: SimpleBookingSummaryProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedBookingId, setSubmittedBookingId] = useState<string | null>(null);
  const [submittedReference, setSubmittedReference] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState({
    fullName: "",
    phone: "",
    email: "",
  });

  // Determine if user is admin/superadmin (direct booking) or public (reservation)
  const isAdminUser = user && (user.role === 'admin' || user.role === 'super-admin');
  const isDirectBooking = isAdminUser;

  // Color mapping for seat types
  const getSeatTypeColors = (type: string) => {
    switch (type) {
      case "vip":
        return { bg: "bg-purple-200", border: "border-purple-400", text: "text-purple-800" };
      case "diamond":
        return { bg: "bg-cyan-200", border: "border-cyan-400", text: "text-cyan-800" };
      case "platinum":
        return { bg: "bg-gray-200", border: "border-gray-400", text: "text-gray-800" };
      case "gold":
        return { bg: "bg-yellow-200", border: "border-yellow-400", text: "text-yellow-800" };
      case "silver":
        return { bg: "bg-slate-200", border: "border-slate-400", text: "text-slate-800" };
      default:
        return { bg: "bg-secondary", border: "border-border", text: "text-secondary-foreground" };
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCompleteBooking = async () => {
    if (!bookingDetails) return;
    
    // Validate required fields
    if (!customerDetails.fullName.trim()) {
      setBookingError("Please enter your full name");
      return;
    }
    
    if (!customerDetails.phone.trim()) {
      setBookingError("Please enter your phone number");
      return;
    }

    // Basic phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(customerDetails.phone)) {
      setBookingError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsProcessing(true);
    setBookingError(null);

    try {
      if (isDirectBooking) {
        // Direct booking for admin/superadmin users
        const { confirmSimpleBooking } = await import("@/lib/api");
        const response = await confirmSimpleBooking({
          booking_id: bookingDetails.booking_id,
          customer_name: customerDetails.fullName,
          customer_phone: customerDetails.phone,
          customer_email: customerDetails.email || null,
        });

        if (response.success) {
          // Redirect to success page
          router.push(
            `/booking/success?booking_id=${bookingDetails.booking_id}&reference=${bookingDetails.booking_reference}`
          );
          onBookingComplete?.(bookingDetails.booking_id);
        } else {
          throw new Error(response.error || "Booking confirmation failed");
        }
      } else {
        // Seat reservation for public users
        const { createPublicSeatReservation } = await import("@/lib/api");
        const response = await createPublicSeatReservation({
          show_id: (showData as any).show?.id || (showData as any).id || 'default-show-id',
          seat_ids: bookingDetails.seats.map(seat => seat.id),
          customer_name: customerDetails.fullName,
          customer_phone: customerDetails.phone,
          customer_email: customerDetails.email || null,
        });

        if (response.success) {
          // Show success message instead of redirecting
          setSubmittedBookingId(response.data.booking_id);
          setSubmittedReference(response.data.booking_reference);
          setIsSubmitted(true);
          onBookingComplete?.(response.data.booking_id);
        } else {
          throw new Error(response.error || "Seat reservation failed");
        }
      }
    } catch (e: any) {
      console.error("❌ Booking Error:", e);
      setBookingError(
        e?.response?.data?.error || e?.message || "Failed to process request"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const isDetailsValid = customerDetails.fullName.trim() && customerDetails.phone.trim();

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            {isDirectBooking ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Booking Summary
              </>
            ) : (
              <>
                <ClockIcon className="h-5 w-5 text-blue-600" />
                Seat Reservation Request
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Movie Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Movie Details</h3>
            <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span className="font-semibold text-foreground">{showData.movie.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span className="text-foreground">{formatDate(showData.showtime.date)} at {showData.showtime.time}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span className="text-foreground">{showData.venue.name} - {showData.screen.name}</span>
              </div>
            </div>
          </div>

          {/* Selected Seats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Selected Seats</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {bookingDetails.seats.map((seat) => {
                  const colors = getSeatTypeColors(seat.category);
                  return (
                    <div key={seat.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                      <div className={`w-5 h-5 ${colors.bg} ${colors.border} border rounded-sm flex-shrink-0`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">{seat.row}{seat.number}</div>
                        <div className="text-xs text-muted-foreground capitalize">{seat.category}</div>
                      </div>
                      {isDirectBooking && (
                        <div className="text-sm font-semibold text-primary">AED {seat.price}</div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {isDirectBooking && (
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="text-base font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">AED {bookingDetails.total_price}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Customer Details Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              {isDirectBooking ? "Customer Details" : "Contact Information"}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={customerDetails.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="w-full h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                  <Phone className="h-4 w-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={customerDetails.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4" />
                  Email Address (Optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={customerDetails.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full h-11"
                />
              </div>
            </div>
          </div>

          {/* Error Display */}
          {bookingError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{bookingError}</p>
            </div>
          )}

          {/* Success Message */}
          {isSubmitted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-green-800">
                  <p className="font-semibold text-lg mb-2">Thank you for your booking!</p>
                  <p className="text-sm mb-2">Your seat reservation request has been placed successfully.</p>
                  <p className="text-sm">
                    <strong>Reservation Reference:</strong> {submittedReference}
                  </p>
                  <p className="text-sm mt-1">
                    Our admin team will review your request and contact you for payment and confirmation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-4">
            {!isDirectBooking && !isSubmitted && (
              <Button
                onClick={handleCompleteBooking}
                disabled={!isDetailsValid || isProcessing}
                className="w-full sm:w-auto px-8 py-3 text-base font-semibold"
              >
                {isProcessing ? "Submitting..." : "Submit Reservation Request"}
              </Button>
            )}
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full sm:w-auto px-8 py-3 text-base font-semibold"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

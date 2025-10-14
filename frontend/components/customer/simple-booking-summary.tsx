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
    category: string;
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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
          {!isDirectBooking && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">This is a seat reservation request</p>
                  <p>Your request will be reviewed by our admin team. You will be contacted for payment and confirmation.</p>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Movie Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Movie Details</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{showData.movie.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(showData.showtime.date)} at {showData.showtime.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{showData.venue.name} - {showData.screen.name}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Selected Seats</h3>
              <div className="space-y-2">
                {bookingDetails.seats.map((seat) => (
                  <div key={seat.id} className="flex justify-between items-center">
                    <span className="font-medium">
                      {seat.row}{seat.number} ({seat.category})
                    </span>
                    {isDirectBooking && (
                      <span className="text-green-600 font-semibold">
                        ₹{seat.price}
                      </span>
                    )}
                  </div>
                ))}
                {isDirectBooking && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-green-600">₹{bookingDetails.total_price}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Details Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {isDirectBooking ? "Customer Details" : "Contact Information"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={customerDetails.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={customerDetails.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address (Optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={customerDetails.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full"
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
          <div className="flex justify-center gap-4 pt-4">
            {!isDirectBooking && !isSubmitted && (
              <Button
                onClick={handleCompleteBooking}
                disabled={!isDetailsValid || isProcessing}
                className="px-8"
              >
                {isProcessing ? "Submitting..." : "Submit Reservation Request"}
              </Button>
            )}
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="px-8"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

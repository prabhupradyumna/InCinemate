"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, User, Phone, Mail, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState({
    fullName: "",
    phone: "",
    email: "",
  });

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
    } catch (e: any) {
      console.error("❌ Booking Error:", e);
      setBookingError(
        e?.response?.data?.error || e?.message || "Failed to confirm booking"
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
            <CheckCircle className="h-5 w-5 text-green-600" />
            Booking Summary
          </CardTitle>
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
                    <span className="text-green-600 font-semibold">
                      ₹{seat.price}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">₹{bookingDetails.total_price}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Details Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Details</h3>
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

          {/* Booking Reference */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Booking Reference:</strong> {bookingDetails.booking_reference}
            </p>
            <p className="text-blue-800 text-sm mt-1">
              Please note this reference number for your records.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1"
            >
              Back to Seats
            </Button>
            <Button
              onClick={handleCompleteBooking}
              disabled={!isDetailsValid || isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "Confirming..." : "Confirm Booking"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

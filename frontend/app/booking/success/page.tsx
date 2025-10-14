"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Calendar, Clock, MapPin, User, Phone, Mail, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface BookingData {
  booking_id: string;
  booking_reference: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  movie_title: string;
  show_date: string;
  show_time: string;
  venue_name: string;
  screen_name: string;
  seats: Array<{
    row: string;
    number: number;
    category: string;
    price: number;
  }>;
  total_price: number;
  booking_status: string;
  created_at: string;
}

export default function BookingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingId = searchParams.get("booking_id");
  const reference = searchParams.get("reference");

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails(bookingId);
    } else {
      setError("Booking ID not found");
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      const { getBookingDetails } = await import("@/lib/api");
      const response = await getBookingDetails(bookingId);
      
      if (response.success) {
        setBookingData(response.data);
      } else {
        setError(response.error || "Failed to fetch booking details");
      }
    } catch (err: any) {
      console.error("Error fetching booking details:", err);
      setError(err.message || "Failed to fetch booking details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => router.push("/")} className="w-full">
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your movie tickets have been successfully booked</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-blue-600" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Reference:</span>
                  <span className="font-semibold">{bookingData.booking_reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {bookingData.booking_status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booked On:</span>
                  <span className="font-semibold">
                    {formatDate(bookingData.created_at)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold">{bookingData.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{bookingData.customer_phone}</span>
                </div>
                {bookingData.customer_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{bookingData.customer_email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Movie Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-red-600" />
                Movie Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold">{bookingData.movie_title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(bookingData.show_date)} at {bookingData.show_time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{bookingData.venue_name} - {bookingData.screen_name}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seat Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-green-600" />
                Seat Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {bookingData.seats.map((seat, index) => (
                  <div key={index} className="flex justify-between items-center">
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
                  <span>Total Amount:</span>
                  <span className="text-green-600">₹{bookingData.total_price}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Important Notes */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Important Notes:</h3>
              <ul className="text-yellow-800 text-sm space-y-1">
                <li>• Please arrive at the cinema at least 15 minutes before the show time</li>
                <li>• Bring a valid ID proof for verification</li>
                <li>• Keep this booking reference number for your records</li>
                <li>• Contact the cinema directly for any changes or cancellations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="px-8"
          >
            Book Another Movie
          </Button>
          <Button
            onClick={() => window.print()}
            className="px-8 bg-blue-600 hover:bg-blue-700"
          >
            Print Ticket
          </Button>
        </div>
      </div>
    </div>
  );
}

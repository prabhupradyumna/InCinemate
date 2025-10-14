"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Ticket,
  Download,
  Home,
  QrCode,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Header } from "@/components/header";

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
  ticket_qr_code?: string;
  created_at: string;
  booking_status: string;
  payment_method: string;
}

export default function TicketPage() {
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
          <p className="text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Header />
          <Card className="bg-white">
            <CardContent className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <CheckCircle className="h-16 w-16 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Error Loading Ticket
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button
                onClick={() => router.push("/")}
                className="bg-primary text-white"
              >
                Go to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ticket Confirmed!
          </h1>
          <p className="text-gray-600">
            Your movie tickets have been successfully booked
          </p>
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
                  <span className="font-semibold">
                    {bookingData.booking_reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    {bookingData.booking_status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold">
                    {bookingData.payment_method}
                  </span>
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

          {/* Movie Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Movie Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">
                  {bookingData.movie_title}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{bookingData.venue_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(bookingData.show_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{bookingData.show_time}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seat Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-purple-600" />
                Seat Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {bookingData.seats.map((seat, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="font-medium">
                      {seat.row}
                      {seat.number} ({seat.category})
                    </span>
                    <span className="text-gray-600">
                      ₹{seat.price.toFixed(2)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span className="text-primary">
                    ₹{bookingData.total_price.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Ticket */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-green-600" />
                Your Digital Ticket
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {bookingData.ticket_qr_code ? (
                <div className="bg-white p-4 rounded-lg inline-block border-2 border-gray-200">
                  <img
                    src={`data:image/png;base64,${bookingData.ticket_qr_code}`}
                    alt="Ticket QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg inline-block border-2 border-gray-200">
                  <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center">
                    <QrCode className="h-24 w-24 text-gray-400" />
                  </div>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Show this QR code at the theater entrance
              </p>
              <p className="text-xs text-muted-foreground">
                Booking Reference: {bookingData.booking_reference}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              // TODO: Implement download functionality
              console.log("Download ticket");
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Ticket
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/")}
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Homepage
          </Button>
        </div>

        {/* Important Notice */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important Information:</p>
                <ul className="space-y-1 text-xs">
                  <li>
                    • Please arrive at least 15 minutes before the show time
                  </li>
                  <li>• Bring a valid ID for verification</li>
                  <li>• Keep this ticket safe - you'll need it for entry</li>
                  <li>• No refunds or exchanges after booking confirmation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar, MapPin, User, Phone, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface ReservationData {
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
  }>;
  booking_status: string;
  created_at: string;
}

export default function ReservationConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reservationData, setReservationData] = useState<ReservationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingId = searchParams.get("booking_id");
  const reference = searchParams.get("reference");

  useEffect(() => {
    if (bookingId) {
      fetchReservationDetails(bookingId);
    } else {
      setError("Reservation ID not found");
      setLoading(false);
    }
  }, [bookingId]);

  const fetchReservationDetails = async (bookingId: string) => {
    try {
      const { getBookingDetails } = await import("@/lib/api");
      const response = await getBookingDetails(bookingId);

      if (response.success) {
        setReservationData(response.data);
      } else {
        setError(response.error || "Failed to fetch reservation details");
      }
    } catch (err: any) {
      console.error("Error fetching reservation details:", err);
      setError(err.message || "Failed to fetch reservation details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reservation details...</p>
        </div>
      </div>
    );
  }

  if (error || !reservationData) {
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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Reservation Not Found</h2>
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reservation Request Submitted!</h1>
          <p className="text-gray-600">Your seat reservation request has been received and is pending approval</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reservation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Reservation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reservation Reference:</span>
                  <span className="font-semibold">{reservationData.booking_reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Pending Approval
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted On:</span>
                  <span className="font-semibold">
                    {formatDate(reservationData.created_at)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold">{reservationData.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{reservationData.customer_phone}</span>
                </div>
                {reservationData.customer_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{reservationData.customer_email}</span>
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
                  <span className="font-semibold">{reservationData.movie_title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(reservationData.show_date)} at {reservationData.show_time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{reservationData.venue_name} - {reservationData.screen_name}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seat Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Reserved Seats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {reservationData.seats.map((seat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">
                      {seat.row}{seat.number} ({seat.category})
                    </span>
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      Reserved
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Important Information */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Our admin team will review your reservation request</li>
                    <li>• You will be contacted via phone or email within 24 hours</li>
                    <li>• Payment details and final confirmation will be provided</li>
                    <li>• Please keep this reference number for your records</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <Button asChild className="px-8 bg-green-600 hover:bg-green-700">
            <a href="tel:+971521101162" aria-label="Call support +971 521101162">
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact
              </span>
            </a>
          </Button>
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
            Print Reservation
          </Button>
        </div>
      </div>
    </div>
  );
}

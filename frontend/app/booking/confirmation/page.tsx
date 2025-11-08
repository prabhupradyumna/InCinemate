"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import { CheckCircle, Calendar, Clock, MapPin, Mail, Download, Home, Phone } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

// Mock booking data - in real app this would come from API/state
const mockBookingData = {
  bookingId: "BK-2024-001234",
  movie: {
    title: "The Dark Knight Returns",
    genre: "Action/Drama",
    duration: 165,
    rating: "PG-13",
  },
  venue: {
    name: "Downtown Cinema",
    address: "123 Main Street, New York, NY",
  },
  screen: "Screen 1",
  showtime: {
    date: "2024-12-15",
    time: "7:00 PM",
  },
  seats: [
    { row: "A", seat: 1, type: "premium" },
    { row: "A", seat: 2, type: "premium" },
  ],
  customer: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
  },
  payment: {
    subtotal: 36.0,
    convenienceFee: 2.5,
    total: 38.5,
    method: "Credit Card ending in 3456",
  },
  qrCode: "/placeholder.svg?height=200&width=200&text=QR+Code",
}

export default function BookingConfirmationPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading confirmation data
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Processing your booking...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
              <p className="text-muted-foreground">
                Your tickets have been booked successfully. A confirmation email has been sent to{" "}
                <span className="text-primary">{mockBookingData.customer.email}</span>
              </p>
            </div>
          </div>

          {/* Booking Details */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Booking Details</span>
                <Badge variant="outline" className="text-green-400 border-green-400">
                  Confirmed
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Booking ID */}
              <div className="bg-muted/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Booking ID</p>
                <p className="text-lg font-mono font-semibold text-primary">{mockBookingData.bookingId}</p>
              </div>

              {/* Movie & Show Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{mockBookingData.movie.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {mockBookingData.movie.genre} • {mockBookingData.movie.duration} min •{" "}
                    {mockBookingData.movie.rating}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{mockBookingData.venue.name}</p>
                      <p className="text-muted-foreground">{mockBookingData.screen}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatDate(mockBookingData.showtime.date)}</p>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {mockBookingData.showtime.time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Seats */}
              <div>
                <h4 className="font-medium mb-2">Your Seats</h4>
                <div className="flex gap-2">
                  {mockBookingData.seats.map((seat, index) => (
                    <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                      {seat.row}
                      {seat.seat} ({seat.type})
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Payment Summary */}
              <div className="space-y-2">
                <h4 className="font-medium">Payment Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${mockBookingData.payment.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Convenience Fee</span>
                    <span>${mockBookingData.payment.convenienceFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Paid</span>
                    <span className="text-primary">${mockBookingData.payment.total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Paid via {mockBookingData.payment.method}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Your Ticket</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-white p-4 rounded-lg inline-block">
                <img
                  src={mockBookingData.qrCode || "/placeholder.svg"}
                  alt="Ticket QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground">Show this QR code at the theater entrance</p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1 bg-green-600 hover:bg-green-700">
              <a href="tel:+917411842999" aria-label="Call support +91 7411842999">
                <span className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact
                </span>
              </a>
            </Button>
            <Button className="flex-1 cinema-glow">
              <Download className="mr-2 h-4 w-4" />
              Download Ticket
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <Mail className="mr-2 h-4 w-4" />
              Email Ticket
            </Button>
          </div>

          {/* Navigation */}
          <div className="text-center pt-6">
            <Link href="/">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                <Home className="mr-2 h-4 w-4" />
                Back to Movies
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

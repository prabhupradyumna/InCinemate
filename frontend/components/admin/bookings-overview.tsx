"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Filter, Download, Eye, RefreshCw, Calendar, Clock, MapPin, User, Phone, Mail } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { getAllBookings } from "@/lib/admin"

interface Booking {
  id: string;
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

export function BookingsOverview() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [searchTerm, statusFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getAllBookings({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
        page: 1,
        limit: 100
      })
      
      // Handle the API response format
      if ((response as any).success) {
        setBookings((response as any).data.bookings || [])
      } else {
        throw new Error((response as any).error || "Failed to fetch bookings")
      }
    } catch (err: any) {
      console.error("Error fetching bookings:", err)
      setError(err.message || "Failed to fetch bookings")
    } finally {
      setLoading(false)
    }
  }

  // Note: Status update functionality removed for simplicity

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_phone.includes(searchTerm) ||
      booking.movie_title.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || booking.booking_status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  const totalRevenue = bookings
    .filter((b) => b.booking_status.toLowerCase() === "pending")
    .reduce((sum, booking) => sum + booking.total_price, 0)

  const totalBookings = bookings.length
  const pendingBookings = bookings.filter((b) => b.booking_status.toLowerCase() === "pending").length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchBookings} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bookings Overview</h2>
          <p className="text-muted-foreground">Monitor and manage all customer bookings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchBookings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by reference, name, phone, or movie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Movie</TableHead>
                  <TableHead>Show Details</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.booking_reference}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.customer_name}</div>
                        <div className="text-sm text-gray-500">{booking.customer_phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{booking.movie_title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(booking.show_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                        <div className="text-gray-500">{booking.show_time}</div>
                        <div className="text-gray-500">{booking.venue_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {booking.seats.map((seat, index) => (
                          <span key={index}>
                            {seat.row}{seat.number}
                            {index < booking.seats.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      AED {booking.total_price}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(booking.booking_status)}>
                        {booking.booking_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Booking Details</DialogTitle>
                            <DialogDescription>
                              Complete information for booking {selectedBooking?.booking_reference}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedBooking && (
                            <div className="space-y-6">
                              {/* Customer Details */}
                              <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Customer Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500">Name:</span>
                                    <div className="font-medium">{selectedBooking.customer_name}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Phone:</span>
                                    <div className="font-medium">{selectedBooking.customer_phone}</div>
                                  </div>
                                  {selectedBooking.customer_email && (
                                    <div className="col-span-2">
                                      <span className="text-gray-500">Email:</span>
                                      <div className="font-medium">{selectedBooking.customer_email}</div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Show Details */}
                              <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  Show Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500">Movie:</span>
                                    <div className="font-medium">{selectedBooking.movie_title}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Date & Time:</span>
                                    <div className="font-medium">
                                        {new Date(selectedBooking.show_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} at {selectedBooking.show_time}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Venue:</span>
                                    <div className="font-medium">{selectedBooking.venue_name}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Screen:</span>
                                    <div className="font-medium">{selectedBooking.screen_name}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Seat Details */}
                              <div>
                                <h3 className="font-semibold mb-3">Seat Details</h3>
                                <div className="space-y-2">
                                  {selectedBooking.seats.map((seat, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                      <span>{seat.row}{seat.number} ({seat.category})</span>
                                      <span className="font-medium">AED {seat.price}</span>
                                    </div>
                                  ))}
                                  <div className="border-t pt-2 flex justify-between items-center font-semibold">
                                    <span>Total:</span>
                                    <span>AED {selectedBooking.total_price}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Booking Status */}
                              <div>
                                <h3 className="font-semibold mb-3">Booking Status</h3>
                                <div className="flex items-center gap-2 mb-4">
                                  <Badge variant={getStatusBadgeVariant(selectedBooking.booking_status)}>
                                    {selectedBooking.booking_status}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    Created: {formatDate(selectedBooking.created_at)}
                                  </span>
                                </div>
                                
                                {/* Note: Status update functionality removed for simplicity */}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No bookings found</p>
              {searchTerm || statusFilter !== "all" ? (
                <p className="text-sm text-gray-500 mt-2">
                  Try adjusting your search criteria
                </p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

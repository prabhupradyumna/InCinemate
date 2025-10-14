"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, RefreshCw, Trash2, Calendar, Clock, MapPin, User, Phone, Mail, Square } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { getAllBookedSeats, deleteBookedSeat } from "@/lib/admin"

interface BookedSeat {
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
  seat_row: string;
  seat_number: number;
  seat_category: string;
  booking_status: string;
  created_at: string;
}

export function BookedSeatsManagement() {
  const [bookedSeats, setBookedSeats] = useState<BookedSeat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSeat, setSelectedSeat] = useState<BookedSeat | null>(null)
  const [deletingSeat, setDeletingSeat] = useState(false)

  useEffect(() => {
    fetchBookedSeats()
  }, [])

  useEffect(() => {
    fetchBookedSeats()
  }, [searchTerm])

  const fetchBookedSeats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getAllBookedSeats({
        search: searchTerm || undefined,
        page: 1,
        limit: 100
      })
      
      if ((response as any).success) {
        setBookedSeats((response as any).data.booked_seats || [])
      } else {
        throw new Error((response as any).error || "Failed to fetch booked seats")
      }
    } catch (err: any) {
      console.error("Error fetching booked seats:", err)
      setError(err.message || "Failed to fetch booked seats")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSeat = async (seatId: string) => {
    try {
      setDeletingSeat(true)
      const response = await deleteBookedSeat(seatId)
      
      if (response.success) {
        // Remove the seat from the local state
        setBookedSeats(prev => prev.filter(seat => seat.id !== seatId))
        
        // Clear selected seat if it's the same one
        if (selectedSeat?.id === seatId) {
          setSelectedSeat(null)
        }
      } else {
        throw new Error(response.error || "Failed to delete booked seat")
      }
    } catch (err: any) {
      console.error("Error deleting booked seat:", err)
      setError(err.message || "Failed to delete booked seat")
    } finally {
      setDeletingSeat(false)
    }
  }

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

  // Color mapping for seat categories (same as customer booking page)
  const getSeatCategoryColors = (category: string) => {
    switch (category.toLowerCase()) {
      case "vip":
        return {
          bg: "bg-purple-200",
          border: "border-purple-400",
          text: "text-purple-800",
          legend: "bg-purple-200 border-purple-400"
        };
      case "diamond":
        return {
          bg: "bg-cyan-200",
          border: "border-cyan-400",
          text: "text-cyan-800",
          legend: "bg-cyan-200 border-cyan-400"
        };
      case "platinum":
        return {
          bg: "bg-gray-200",
          border: "border-gray-400",
          text: "text-gray-800",
          legend: "bg-gray-200 border-gray-400"
        };
      case "gold":
        return {
          bg: "bg-yellow-200",
          border: "border-yellow-400",
          text: "text-yellow-800",
          legend: "bg-yellow-200 border-yellow-400"
        };
      case "silver":
        return {
          bg: "bg-slate-200",
          border: "border-slate-400",
          text: "text-slate-800",
          legend: "bg-slate-200 border-slate-400"
        };
      default:
        return {
          bg: "bg-secondary",
          border: "border-border",
          text: "text-muted-foreground",
          legend: "bg-secondary border-border"
        };
    }
  }

  const filteredBookedSeats = bookedSeats.filter((seat) => {
    const matchesSearch = 
      seat.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seat.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seat.customer_phone.includes(searchTerm) ||
      seat.movie_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${seat.seat_row}${seat.seat_number}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const totalSeats = bookedSeats.length
  const pendingSeats = bookedSeats.filter((s) => s.booking_status.toLowerCase() === "pending").length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading booked seats...</p>
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
          <Button onClick={fetchBookedSeats} variant="outline">
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
          <h2 className="text-2xl font-bold">Booked Seats Management</h2>
          <p className="text-muted-foreground">Manage and release booked seats from all admins</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchBookedSeats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{totalSeats}</div>
            <p className="text-sm text-muted-foreground">Total Booked Seats</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-400">{pendingSeats}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
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
                  placeholder="Search by reference, name, phone, movie, or seat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booked Seats Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Booked Seats</CardTitle>
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
                  <TableHead>Seat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookedSeats.map((seat) => (
                  <TableRow key={seat.id}>
                    <TableCell className="font-medium">
                      {seat.booking_reference}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{seat.customer_name}</div>
                        <div className="text-sm text-gray-500">{seat.customer_phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{seat.movie_title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(seat.show_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                        <div className="text-gray-500">{seat.show_time}</div>
                        <div className="text-gray-500">{seat.venue_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Square className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{seat.seat_row}{seat.seat_number}</span>
                        <div className={`px-2 py-1 rounded-md text-xs font-medium ${getSeatCategoryColors(seat.seat_category).bg} ${getSeatCategoryColors(seat.seat_category).text} ${getSeatCategoryColors(seat.seat_category).border} border`}>
                          {seat.seat_category}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(seat.booking_status)}>
                        {seat.booking_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedSeat(seat)}
                            >
                              <Search className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Booked Seat Details</DialogTitle>
                              <DialogDescription>
                                Complete information for seat {selectedSeat?.seat_row}{selectedSeat?.seat_number}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedSeat && (
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
                                      <div className="font-medium">{selectedSeat.customer_name}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Phone:</span>
                                      <div className="font-medium">{selectedSeat.customer_phone}</div>
                                    </div>
                                    {selectedSeat.customer_email && (
                                      <div className="col-span-2">
                                        <span className="text-gray-500">Email:</span>
                                        <div className="font-medium">{selectedSeat.customer_email}</div>
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
                                      <div className="font-medium">{selectedSeat.movie_title}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Date & Time:</span>
                                      <div className="font-medium">
                                        {new Date(selectedSeat.show_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} at {selectedSeat.show_time}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Venue:</span>
                                      <div className="font-medium">{selectedSeat.venue_name}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Screen:</span>
                                      <div className="font-medium">{selectedSeat.screen_name}</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Seat Details */}
                                <div>
                                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Square className="h-4 w-4" />
                                    Seat Information
                                  </h3>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">Seat:</span>
                                      <div className="font-medium">{selectedSeat.seat_row}{selectedSeat.seat_number}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Category:</span>
                                      <div className="font-medium">
                                        <div className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${getSeatCategoryColors(selectedSeat.seat_category).bg} ${getSeatCategoryColors(selectedSeat.seat_category).text} ${getSeatCategoryColors(selectedSeat.seat_category).border} border`}>
                                          {selectedSeat.seat_category}
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Status:</span>
                                      <div className="font-medium">
                                        <Badge variant={getStatusBadgeVariant(selectedSeat.booking_status)}>
                                          {selectedSeat.booking_status}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Booked At:</span>
                                      <div className="font-medium">{new Date(selectedSeat.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div>
                                  <h3 className="font-semibold mb-3">Actions</h3>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteSeat(selectedSeat.id)}
                                      disabled={deletingSeat}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      {deletingSeat ? "Releasing..." : "Release Seat"}
                                    </Button>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2">
                                    This will permanently remove the seat booking and make it available for others.
                                  </p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSeat(seat.id)}
                          disabled={deletingSeat}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredBookedSeats.length === 0 && (
            <div className="text-center py-8">
              <Square className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No booked seats found</p>
              {searchTerm ? (
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

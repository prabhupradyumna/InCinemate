"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Search,
  Filter,
  Eye,
  Download,
  RefreshCw,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

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

interface BookingsManagementProps {
  className?: string;
}

export function BookingsManagement({ className }: BookingsManagementProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [searchTerm, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Import the appropriate API based on user role
      const { getAllBookings } = await import("@/lib/superadmin");
      const response = await getAllBookings({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
        page: 1,
        limit: 100
      });
      
      if (response.success) {
        setBookings(response.data.bookings);
      } else {
        throw new Error(response.error || "Failed to fetch bookings");
      }
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_phone.includes(searchTerm) ||
      booking.movie_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.booking_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const exportBookings = () => {
    const csvContent = [
      ["Booking Reference", "Customer Name", "Phone", "Email", "Movie", "Show Date", "Show Time", "Venue", "Screen", "Seats", "Total Price", "Status", "Created At"],
      ...filteredBookings.map(booking => [
        booking.booking_reference,
        booking.customer_name,
        booking.customer_phone,
        booking.customer_email || "",
        booking.movie_title,
        booking.show_date,
        booking.show_time,
        booking.venue_name,
        booking.screen_name,
        booking.seats.map(s => `${s.row}${s.number}`).join(", "),
        booking.total_price,
        booking.booking_status,
        formatDate(booking.created_at)
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchBookings} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Bookings Management
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={fetchBookings} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportBookings} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by reference, name, phone, or movie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-48">
            <Label htmlFor="status">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bookings Table */}
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
                      <div>{formatDate(booking.show_date)}</div>
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
                    ₹ {booking.total_price}
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
                                    {formatDate(selectedBooking.show_date)} at {selectedBooking.show_time}
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
                                    <span className="font-medium">₹ {seat.price}</span>
                                  </div>
                                ))}
                                <div className="border-t pt-2 flex justify-between items-center font-semibold">
                                  <span>Total:</span>
                                  <span>₹ {selectedBooking.total_price}</span>
                                </div>
                              </div>
                            </div>

                            {/* Booking Status */}
                            <div>
                              <h3 className="font-semibold mb-3">Booking Status</h3>
                              <div className="flex items-center gap-2">
                                <Badge variant={getStatusBadgeVariant(selectedBooking.booking_status)}>
                                  {selectedBooking.booking_status}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  Created: {formatDate(selectedBooking.created_at)}
                                </span>
                              </div>
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
  );
}

"use client";

import { SeatSelection } from "@/components/seat-selection";
import { Header } from "@/components/header";
import { BookingSummary } from "@/components/booking-summary";

// Mock data - in real app this would come from API based on movieId
const mockShowData = {
  movie: {
    id: "1",
    title: "The Dark Knight Returns",
    genre: "Action/Drama",
    duration: 165,
    rating: "PG-13",
    posterUrl: "/placeholder.svg?key=4jm52",
  },
  venue: {
    name: "Downtown Cinema",
    address: "123 Main Street, New York, NY",
  },
  screen: {
    name: "Screen 1",
    seatMap: {
      rows: [
        { row: "A", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], type: "premium" },
        { row: "B", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], type: "premium" },
        {
          row: "C",
          seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          type: "regular",
        },
        {
          row: "D",
          seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          type: "regular",
        },
        {
          row: "E",
          seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          type: "regular",
        },
        {
          row: "F",
          seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          type: "regular",
        },
        {
          row: "G",
          seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          type: "regular",
        },
        {
          row: "H",
          seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          type: "regular",
        },
      ],
    },
  },
  showtime: {
    date: "2024-12-15",
    time: "7:00 PM",
    pricing: {
      premium: 18.0,
      regular: 12.0,
    },
  },
  bookedSeats: [
    { row: "A", seat: 5 },
    { row: "A", seat: 6 },
    { row: "C", seat: 8 },
    { row: "D", seat: 3 },
    { row: "D", seat: 4 },
    { row: "F", seat: 7 },
  ],
};

export default function BookingPage({
  params,
}: {
  params: { movieId: string };
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SeatSelection showData={mockShowData as any} />
          </div>
          <div className="lg:col-span-1">
            <BookingSummary showData={mockShowData as any} />
          </div>
        </div>
      </main>
    </div>
  );
}

import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Simulate booking creation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock booking response
    const booking = {
      id: `BK-${Date.now()}`,
      status: "confirmed",
      movie: body.movie,
      showtime: body.showtime,
      seats: body.seats,
      customer: body.customer,
      payment: {
        ...body.payment,
        transactionId: `TXN-${Date.now()}`,
        status: "completed",
      },
      qrCode: `/api/bookings/${Date.now()}/qr`,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create booking" }, { status: 500 })
  }
}

export async function GET() {
  // Mock bookings list
  const bookings = [
    {
      id: "BK-2024-001234",
      movie: "The Dark Knight Returns",
      showtime: "2024-12-15T19:00:00Z",
      status: "confirmed",
      total: 38.5,
    },
  ]

  return NextResponse.json({ bookings })
}

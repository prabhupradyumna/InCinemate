"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

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
  bookedSeats: Array<{
    row: string;
    seat: number;
  }>;
}

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (details: {
    fullName: string;
    email: string;
    phone: string;
  }) => void;
  showData: ShowData;
  selectedSeats: Array<{
    row: string;
    seat: number;
    type: "premium" | "regular";
  }>;
}

export function CustomerDetailsModal({
  isOpen,
  onClose,
  onContinue,
  showData,
  selectedSeats,
}: CustomerDetailsModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const subtotal = selectedSeats.reduce((total, seat) => {
    return total + showData.showtime.pricing[seat.type];
  }, 0);

  const convenienceFee = 2.5;
  const total = subtotal + convenienceFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onContinue(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-lg">{showData.movie.title}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div>{showData.venue.name}</div>
              <div>
                {showData.showtime.date} at {showData.showtime.time}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Selected Seats</h4>
              <div className="space-y-1">
                {selectedSeats.map((seat, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {seat.row}
                      {seat.seat} ({seat.type})
                    </span>
                    <span>
                      ₹{showData.showtime.pricing[seat.type].toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Convenience Fee</span>
                <span>₹{convenienceFee.toFixed(0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-blue-600">₹{total.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Customer Details Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send OTP & Continue"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

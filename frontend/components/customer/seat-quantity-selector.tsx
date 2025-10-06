"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface SeatCategory {
  name: string;
  price: number;
  status: "available" | "almost_full" | "sold_out";
}

interface SeatQuantitySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  categories: SeatCategory[];
  selectedQuantity?: number;
}

export function SeatQuantitySelector({
  isOpen,
  onClose,
  onConfirm,
  categories,
  selectedQuantity = 1,
}: SeatQuantitySelectorProps) {
  const [quantity, setQuantity] = useState(selectedQuantity);

  const handleConfirm = () => {
    onConfirm(quantity);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "almost_full":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "sold_out":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "AVAILABLE";
      case "almost_full":
        return "ALMOST FULL";
      case "sold_out":
        return "SOLD OUT";
      default:
        return "UNKNOWN";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>How many seats?</span>
            <div className="ml-auto">
              {/* Scooter illustration placeholder */}
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-blue-400 rounded-full flex items-center justify-center">
                🛵
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quantity Selection */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <Button
                  key={num}
                  variant={quantity === num ? "default" : "outline"}
                  size="sm"
                  className={`w-10 h-10 p-0 ${
                    quantity === num
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setQuantity(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Seat Categories */}
          <div className="space-y-3">
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="font-medium">{category.name}</div>
                  <Badge
                    variant="outline"
                    className={getStatusColor(category.status)}
                  >
                    {getStatusText(category.status)}
                  </Badge>
                </div>
                <div className="font-semibold text-primary">
                  ₹{category.price}
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <Button
            className="w-full bg-pink-500 hover:bg-pink-600 text-white"
            onClick={handleConfirm}
            disabled={quantity === 0}
          >
            Select Seats
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

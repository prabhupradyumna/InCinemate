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
import { useAuth } from "@/components/customer/auth-provider";

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
  const { user } = useAuth();
  
  // Determine if user is admin/superadmin (can see pricing)
  const isAdminUser = user && (user.role === 'admin' || user.role === 'super-admin');

  const handleConfirm = () => {
    onConfirm(quantity);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800";
      case "almost_full":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "sold_out":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800";
      default:
        return "bg-muted text-muted-foreground border-border";
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

  // Color mapping for seat types
  const getSeatTypeColors = (type: string) => {
    switch (type.toLowerCase()) {
      case "vip":
        return { bg: "bg-purple-200", border: "border-purple-400", text: "text-purple-800" };
      case "diamond":
        return { bg: "bg-cyan-200", border: "border-cyan-400", text: "text-cyan-800" };
      case "platinum":
        return { bg: "bg-gray-200", border: "border-gray-400", text: "text-gray-800" };
      case "gold":
        return { bg: "bg-yellow-200", border: "border-yellow-400", text: "text-yellow-800" };
      case "silver":
        return { bg: "bg-slate-200", border: "border-slate-400", text: "text-slate-800" };
      default:
        return { bg: "bg-secondary", border: "border-border", text: "text-secondary-foreground" };
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
            {categories.map((category, index) => {
              const colors = getSeatTypeColors(category.name);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 ${colors.bg} ${colors.border} border rounded-sm flex-shrink-0`}></div>
                    <div className="font-medium capitalize">{category.name}</div>
                    <Badge
                      variant="outline"
                      className={getStatusColor(category.status)}
                    >
                      {getStatusText(category.status)}
                    </Badge>
                  </div>
                  {isAdminUser && (
                    <div className="font-semibold text-primary">
                      AED {category.price}
                    </div>
                  )}
                </div>
              );
            })}
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

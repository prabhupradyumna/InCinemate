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
import { X } from "lucide-react";

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
      <DialogContent
        className="max-h-[85vh] overflow-y-auto overflow-x-hidden !p-0 !fixed !bottom-0 !left-0 !right-0 !top-auto !translate-x-0 !translate-y-0 !w-full !max-w-full !rounded-t-2xl md:!max-w-md md:!left-1/2 md:!right-auto md:!-translate-x-1/2 md:!bottom-auto md:!top-1/2 md:!-translate-y-1/2 md:!rounded-lg !grid-cols-1 !gap-0"
        showCloseButton={false}
      >
        {/* Mobile-optimized bottom sheet layout */}
        <div className="bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-lg flex flex-col w-full">
          {/* Drag handle - only visible on mobile */}
          <div className="flex justify-center pt-3 pb-2 md:hidden">
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>

          {/* Header with close button */}
          <div className="relative flex items-center justify-center p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="text-base md:text-lg font-semibold text-gray-900 dark:text-white text-center">
              How many seats?
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-3 md:right-4 h-7 w-7 md:h-8 md:w-8 p-0 rounded-full bg-gradient-to-r from-yellow-400 to-blue-400 hover:from-yellow-500 hover:to-blue-500"
            >
              <X className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
            </Button>
          </div>

          {/* Illustration */}
          <div className="flex justify-center py-3 md:py-4">
            <div className="text-4xl md:text-6xl">
              {quantity === 1 ? "🚲" :
                quantity === 2 ? "🚴‍♀️🚴‍♂️" :
                  quantity === 3 ? "🚴‍♀️🚴‍♂️🚴‍♀️" :
                    quantity === 4 ? "🚴‍♀️🚴‍♂️🚴‍♀️🚴‍♂️" :
                      quantity === 5 ? "🚴‍♀️🚴‍♂️🚴‍♀️🚴‍♂️🚴‍♀️" :
                        quantity === 6 ? "🚴‍♀️🚴‍♂️🚴‍♀️🚴‍♂️🚴‍♀️🚴‍♂️" :
                          quantity === 7 ? "🚴‍♀️🚴‍♂️🚴‍♀️🚴‍♂️🚴‍♀️🚴‍♂️🚴‍♀️" :
                            quantity === 8 ? "🚴‍♀️🚴‍♂️🚴‍♀️🚴‍♂️🚴‍♀️🚴‍♂️🚴‍♀️🚴‍♂️" :
                              quantity === 9 ? "🚴‍♀️🚴‍♂️🚴‍♀️🚴‍♂️🚴‍♀️🚴‍♂️🚴‍♀️🚴‍♂️🚴‍♀️" :
                                "🚴‍♀️🚴‍♂️🚴‍♀️🚴‍♂️🚴‍♀️🚴‍♂️🚴‍♀️🚴‍♂️🚴‍♀️🚴‍♂️"}
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="px-3 pb-3 md:px-4 md:pb-4 flex justify-center">
            <div className="flex gap-1.5 md:gap-2 overflow-x-auto md:overflow-x-visible scrollbar-hide justify-center items-center w-full max-w-sm">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <Button
                  key={num}
                  variant="ghost"
                  size="sm"
                  className={`w-8 h-8 md:w-9 md:h-9 p-0 text-xs md:text-sm font-medium rounded-full transition-all flex-shrink-0 flex items-center justify-center min-w-0 min-h-0 ${quantity === num
                    ? "bg-red-500 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  onClick={() => setQuantity(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          {/* Seat Categories - Side by Side Design */}
          <div className="px-3 pb-3 md:px-4 md:pb-4 flex justify-center">
            <div className="grid grid-cols-2 gap-2 md:gap-3 w-full max-w-sm">
              {categories.map((category, index) => {
                const colors = getSeatTypeColors(category.name);
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center py-1.5 px-1.5 md:py-2 md:px-2 rounded-md bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-1 md:gap-1.5 mb-0.5 md:mb-1">
                      <div className={`w-2 h-2 md:w-2.5 md:h-2.5 ${colors.bg} ${colors.border} border rounded-sm flex-shrink-0`}></div>
                      <span className="text-xs font-medium text-gray-900 dark:text-white capitalize">
                        {category.name}
                      </span>
                    </div>
                    {isAdminUser && (
                      <div className="text-xs md:text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                        ₹ {category.price}
                      </div>
                    )}
                    <Badge
                      variant="outline"
                      className={`text-xs px-1 py-0.5 ${category.status === "available"
                        ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                        : category.status === "almost_full"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
                          : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                        }`}
                    >
                      {category.status === "available" ? "AVAILABLE" :
                        category.status === "almost_full" ? "FILLING FAST" : "SOLD OUT"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>


          {/* Action Button */}
          <div className="p-3 pt-0 md:p-4 md:pt-0">
            <div className="flex justify-center">
              <Button
                className="w-full max-w-xs md:max-w-sm bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 md:py-3 rounded-lg transition-colors text-sm md:text-base"
                onClick={handleConfirm}
                disabled={quantity === 0}
              >
                Select Seats
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DollarSign, Save, X, MapPin, Eye, EyeOff } from "lucide-react";

interface Seat {
  id: string;
  row: string; // Backend uses 'row' as string
  number: number; // Backend uses 'number' as integer
  category: string;
  x_position?: number;
  y_position?: number;
}

interface SeatPricingData {
  seat_id: string;
  row: string;
  number: number;
  category: string;
  base_price: number | null;
  show_price: number | null;
}

interface PricingEditorProps {
  auditoriumSeats: Seat[];
  seatPricingData: SeatPricingData[];
  onSave: (seatPricing: Array<{ seat_id: string; price: number }>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PricingEditor({
  auditoriumSeats,
  seatPricingData,
  onSave,
  onCancel,
  isLoading = false,
}: PricingEditorProps) {
  const [seatPricing, setSeatPricing] = useState<Record<string, number>>({});
  const [categoryPricing, setCategoryPricing] = useState<
    Record<string, number>
  >({
    premium: 300,
    regular: 200,
    vip: 500,
  });
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showPrices, setShowPrices] = useState(false);
  const [applyingCategory, setApplyingCategory] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState<"single" | "multiple">(
    "single"
  );
  const [bulkPriceDialogOpen, setBulkPriceDialogOpen] = useState(false);

  // Initialize pricing when seats and pricing data are loaded
  useEffect(() => {
    console.log("PricingEditor: Initializing pricing...");
    console.log("PricingEditor: Auditorium seats:", auditoriumSeats.length);
    console.log("PricingEditor: Seat pricing data:", seatPricingData.length);

    if (auditoriumSeats.length > 0 && seatPricingData.length > 0) {
      const initialPricing: Record<string, number> = {};

      // Create a map of pricing data for quick lookup
      const pricingMap = new Map(seatPricingData.map((p) => [p.seat_id, p]));

      auditoriumSeats.forEach((seat) => {
        const pricingInfo = pricingMap.get(seat.id);

        // Priority: show_price > base_price > category default
        if (
          pricingInfo?.show_price !== null &&
          pricingInfo?.show_price !== undefined
        ) {
          initialPricing[seat.id] = pricingInfo.show_price;
          console.log(
            `Seat ${seat.row}${seat.number}: Using show price ${pricingInfo.show_price}`
          );
        } else if (
          pricingInfo?.base_price !== null &&
          pricingInfo?.base_price !== undefined
        ) {
          initialPricing[seat.id] = pricingInfo.base_price;
          console.log(
            `Seat ${seat.row}${seat.number}: Using base price ${pricingInfo.base_price}`
          );
        } else {
          // Fallback to category pricing
          const category = seat.category?.toLowerCase() || "regular";
          initialPricing[seat.id] =
            categoryPricing[category] || categoryPricing.regular;
          console.log(
            `Seat ${seat.row}${seat.number}: Using category price ${initialPricing[seat.id]} (${category})`
          );
        }
      });

      setSeatPricing(initialPricing);
    } else if (auditoriumSeats.length > 0) {
      // Fallback to category pricing if no pricing data available
      console.log("PricingEditor: No pricing data, using category defaults");
      const initialPricing: Record<string, number> = {};
      auditoriumSeats.forEach((seat) => {
        const category = seat.category?.toLowerCase() || "regular";
        initialPricing[seat.id] =
          categoryPricing[category] || categoryPricing.regular;
      });
      setSeatPricing(initialPricing);
    }
  }, [auditoriumSeats, seatPricingData, categoryPricing]);

  const handleCategoryPricingChange = (category: string, value: number) => {
    setCategoryPricing((prev) => ({
      ...prev,
      [category]: value,
    }));
    // Note: Prices are only applied when "Apply" button is clicked
  };

  const handleSeatPricingChange = (seatId: string, value: number) => {
    setSeatPricing((prev) => ({
      ...prev,
      [seatId]: value,
    }));
  };

  const handleSeatClick = (seat: Seat) => {
    if (selectionMode === "single") {
      setSelectedSeat(seat);
      setEditDialogOpen(true);
    } else {
      // Multiple selection mode
      const newSelectedSeats = new Set(selectedSeats);
      if (newSelectedSeats.has(seat.id)) {
        newSelectedSeats.delete(seat.id);
      } else {
        newSelectedSeats.add(seat.id);
      }
      setSelectedSeats(newSelectedSeats);
    }
  };

  const handleSeatPriceUpdate = (seatId: string, newPrice: number) => {
    setSeatPricing((prev) => ({
      ...prev,
      [seatId]: newPrice,
    }));
    setEditDialogOpen(false);
    setSelectedSeat(null);
  };

  const handleApplyCategoryPricing = async (category: string) => {
    try {
      setApplyingCategory(category);

      // Find all seats of this category
      const categorySeats = auditoriumSeats.filter(
        (seat) => seat.category?.toLowerCase() === category.toLowerCase()
      );

      // Update pricing for all seats in this category
      const updatedPricing = { ...seatPricing };
      categorySeats.forEach((seat) => {
        updatedPricing[seat.id] = categoryPricing[category];
      });

      setSeatPricing(updatedPricing);

      // Show success message
      setTimeout(() => {
        setApplyingCategory(null);
      }, 1000);
    } catch (error) {
      console.error("Error applying category pricing:", error);
      setApplyingCategory(null);
    }
  };

  const handleSelectRow = (rowNumber: string) => {
    const rowSeats = auditoriumSeats.filter((seat) => seat.row === rowNumber);
    const rowSeatIds = new Set(rowSeats.map((seat) => seat.id));
    setSelectedSeats(rowSeatIds);
    setSelectionMode("multiple");
  };

  const handleSelectColumn = (columnNumber: number) => {
    const columnSeats = auditoriumSeats.filter(
      (seat) => seat.number === columnNumber
    );
    const columnSeatIds = new Set(columnSeats.map((seat) => seat.id));
    setSelectedSeats(columnSeatIds);
    setSelectionMode("multiple");
  };

  const handleSelectAll = () => {
    const allSeatIds = new Set(auditoriumSeats.map((seat) => seat.id));
    setSelectedSeats(allSeatIds);
    setSelectionMode("multiple");
  };

  const handleClearSelection = () => {
    setSelectedSeats(new Set());
    setSelectionMode("single");
  };

  const handleBulkPriceUpdate = (newPrice: number) => {
    const updatedPricing = { ...seatPricing };
    selectedSeats.forEach((seatId) => {
      updatedPricing[seatId] = newPrice;
    });
    setSeatPricing(updatedPricing);
    setBulkPriceDialogOpen(false);
    setSelectedSeats(new Set());
    setSelectionMode("single");
  };

  const handleSave = () => {
    const pricingArray = Object.entries(seatPricing).map(([seatId, price]) => ({
      seat_id: seatId,
      price: Number(price),
    }));
    onSave(pricingArray);
  };

  const handleReset = () => {
    const resetPricing: Record<string, number> = {};
    auditoriumSeats.forEach((seat) => {
      const category = seat.category?.toLowerCase() || "regular";
      resetPricing[seat.id] =
        categoryPricing[category] || categoryPricing.regular;
    });
    setSeatPricing(resetPricing);
  };

  // Group seats by row for display
  const seatsByRow = auditoriumSeats.reduce(
    (acc, seat) => {
      const row = seat.row;
      if (!acc[row]) {
        acc[row] = [];
      }
      acc[row].push(seat);
      return acc;
    },
    {} as Record<string, Seat[]>
  );

  // Create visual seat map using x_position and y_position
  const createVisualSeatMap = () => {
    // Group seats by row for display
    const rows: Record<string, Seat[]> = {};

    auditoriumSeats.forEach((seat) => {
      if (!rows[seat.row]) {
        rows[seat.row] = [];
      }
      rows[seat.row].push(seat);
    });

    // Sort seats within each row by seat number
    Object.keys(rows).forEach((rowKey) => {
      rows[rowKey].sort((a, b) => a.number - b.number);
    });

    // Sort rows naturally
    const sortedRows = Object.keys(rows).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );

    return sortedRows.map((rowKey) => ({
      rowNumber: rowKey,
      seats: rows[rowKey],
    }));
  };

  const visualRows = createVisualSeatMap();

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "premium":
        return "bg-blue-500 hover:bg-blue-600 border-blue-600";
      case "vip":
        return "bg-purple-500 hover:bg-purple-600 border-purple-600";
      case "regular":
        return "bg-green-500 hover:bg-green-600 border-green-600";
      default:
        return "bg-gray-500 hover:bg-gray-600 border-gray-600";
    }
  };

  const getCategoryTextColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "premium":
        return "text-blue-800";
      case "vip":
        return "text-purple-800";
      case "regular":
        return "text-green-800";
      default:
        return "text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrices(!showPrices)}
          >
            {showPrices ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {showPrices ? "Hide Prices" : "Show Prices"}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant={selectionMode === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectionMode("single")}
            >
              Single Edit
            </Button>
            <Button
              variant={selectionMode === "multiple" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectionMode("multiple")}
            >
              Multi Select
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Total Seats: {auditoriumSeats.length} |
          {selectionMode === "single"
            ? " Click seats to edit pricing"
            : ` ${selectedSeats.size} seats selected`}
        </div>
      </div>

      {/* Selection Controls */}
      {selectionMode === "multiple" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selection Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Quick Select:</span>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  All Seats
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSelection}
                >
                  Clear
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Rows:</span>
                {visualRows.map(({ rowNumber }) => (
                  <Button
                    key={rowNumber}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectRow(rowNumber)}
                  >
                    Row {rowNumber}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Columns:</span>
                {Array.from(
                  { length: Math.max(...auditoriumSeats.map((s) => s.number)) },
                  (_, i) => i + 1
                ).map((colNum) => (
                  <Button
                    key={colNum}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectColumn(colNum)}
                  >
                    Col {colNum}
                  </Button>
                ))}
              </div>

              {selectedSeats.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setBulkPriceDialogOpen(true)}
                  >
                    Set Price ({selectedSeats.size} seats)
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category-based Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Category-based Pricing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(categoryPricing).map(([category, price]) => (
              <div key={category} className="space-y-2">
                <Label htmlFor={`category-${category}`} className="capitalize">
                  {category} Seats
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">₹</span>
                  <Input
                    id={`category-${category}`}
                    type="number"
                    value={price}
                    onChange={(e) =>
                      handleCategoryPricingChange(
                        category,
                        Number(e.target.value)
                      )
                    }
                    className="text-right"
                    min="0"
                    step="10"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApplyCategoryPricing(category)}
                  disabled={applyingCategory === category}
                  className="w-full"
                >
                  {applyingCategory === category ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                      Applying...
                    </>
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Click "Apply" to update all seats of that category with the new
            price.
          </div>
        </CardContent>
      </Card>

      {/* Visual Seat Map */}
      <Card>
        <CardHeader>
          <CardTitle>Auditorium Layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Screen Indicator */}
          <div className="flex justify-center">
            <div className="w-3/4 h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full opacity-60"></div>
          </div>
          <div className="text-center text-sm text-muted-foreground mb-8">
            SCREEN
          </div>

          {/* Seat Map */}
          <div className="space-y-4">
            {visualRows.map(({ rowNumber, seats }) => (
              <div
                key={rowNumber}
                className="flex items-center justify-center gap-6"
              >
                <div className="w-8 text-sm font-medium text-muted-foreground">
                  {rowNumber}
                </div>
                <div className="flex gap-3">
                  {seats.map((seat) => (
                    <div key={seat.id} className="flex flex-col items-center">
                      <button
                        onClick={() => handleSeatClick(seat)}
                        className={`
                          w-10 h-10 rounded border-2 flex items-center justify-center text-xs font-medium
                          transition-all duration-200 cursor-pointer
                          ${
                            selectedSeats.has(seat.id)
                              ? "bg-yellow-400 border-yellow-600 text-yellow-900 hover:bg-yellow-500 ring-2 ring-yellow-600"
                              : getCategoryColor(seat.category)
                          }
                          text-white hover:scale-105
                        `}
                        title={`Seat ${seat.number} - ${seat.category || "Regular"} - ₹${seatPricing[seat.id] || 0}`}
                      >
                        {seat.number}
                      </button>
                      {showPrices && (
                        <div className="text-xs text-muted-foreground mt-1 font-medium">
                          ₹{seatPricing[seat.id] || 0}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="w-8 text-sm font-medium text-muted-foreground">
                  {rowNumber}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t">
            <div className="text-sm font-medium">Categories:</div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded border-2"></div>
              <span className="text-sm">Regular</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded border-2"></div>
              <span className="text-sm">Premium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded border-2"></div>
              <span className="text-sm">VIP</span>
            </div>
            {selectionMode === "multiple" && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded border-2 border-yellow-600"></div>
                <span className="text-sm">Selected</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleReset} disabled={isLoading}>
          Reset to Category Prices
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Pricing"}
          </Button>
        </div>
      </div>

      {/* Seat Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Seat Pricing</DialogTitle>
          </DialogHeader>
          {selectedSeat && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Row:</strong> {selectedSeat.row}
                </div>
                <div>
                  <strong>Seat:</strong> {selectedSeat.number}
                </div>
                <div>
                  <strong>Category:</strong>
                  <Badge
                    className={`ml-2 ${getCategoryTextColor(selectedSeat.category)}`}
                  >
                    {selectedSeat.category || "Regular"}
                  </Badge>
                </div>
                <div>
                  <strong>Current Price:</strong> ₹
                  {seatPricing[selectedSeat.id] || 0}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seat-price">New Price (₹)</Label>
                <Input
                  id="seat-price"
                  type="number"
                  defaultValue={seatPricing[selectedSeat.id] || 0}
                  min="0"
                  step="10"
                  placeholder="Enter price"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const input = document.getElementById(
                      "seat-price"
                    ) as HTMLInputElement;
                    const newPrice = Number(input.value);
                    handleSeatPriceUpdate(selectedSeat.id, newPrice);
                  }}
                  className="flex-1"
                >
                  Update Price
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Price Dialog */}
      <Dialog open={bulkPriceDialogOpen} onOpenChange={setBulkPriceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Price for Selected Seats</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              You have selected <strong>{selectedSeats.size}</strong> seats.
              Enter the price to apply to all selected seats.
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-price">Price for All Selected Seats</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">₹</span>
                <Input
                  id="bulk-price"
                  type="number"
                  placeholder="Enter price"
                  min="0"
                  step="10"
                  className="text-right"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setBulkPriceDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const input = document.getElementById(
                    "bulk-price"
                  ) as HTMLInputElement;
                  const price = Number(input.value);
                  if (price > 0) {
                    handleBulkPriceUpdate(price);
                  }
                }}
              >
                Apply to {selectedSeats.size} Seats
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

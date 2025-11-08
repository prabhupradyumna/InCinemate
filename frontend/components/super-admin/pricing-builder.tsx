"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  Settings,
  Zap,
  Eye,
  Plus,
  Minus,
  Info,
  Crown,
  Star,
  Circle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SeatData {
  id: string;
  row: string;
  number: number;
  category: string;
  x_position?: number;
  y_position?: number;
  is_active: boolean;
}

interface PricingBuilderProps {
  auditoriumId: string;
  auditoriumSeats: SeatData[];
  pricingMode: "simple" | "advanced";
  simplePricing: {
    premium: number;
    regular: number;
    vip?: number;
  };
  advancedPricing?: Array<{
    seat_id: string;
    price: number;
  }>;
  onPricingModeChange: (mode: "simple" | "advanced") => void;
  onSimplePricingChange: (category: string, price: number) => void;
  onAdvancedPricingChange: (
    pricing: Array<{ seat_id: string; price: number }>
  ) => void;
}

export function PricingBuilder({
  auditoriumId,
  auditoriumSeats,
  pricingMode,
  simplePricing,
  advancedPricing,
  onPricingModeChange,
  onSimplePricingChange,
  onAdvancedPricingChange,
}: PricingBuilderProps) {
  const { toast } = useToast();

  // Advanced pricing state
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [seatPricing, setSeatPricing] = useState<Map<string, number>>(
    new Map()
  );

  // Initialize seat pricing from advanced pricing prop
  useEffect(() => {
    if (advancedPricing) {
      const pricingMap = new Map();
      advancedPricing.forEach((item) => {
        pricingMap.set(item.seat_id, item.price);
      });
      setSeatPricing(pricingMap);
    }
  }, [advancedPricing]);

  // Get unique categories from seats
  const seatCategories = Array.from(
    new Set(auditoriumSeats.map((seat) => seat.category))
  );

  // Group seats by row for visualization
  const seatsByRow = auditoriumSeats.reduce(
    (acc, seat) => {
      if (!acc[seat.row]) {
        acc[seat.row] = [];
      }
      acc[seat.row].push(seat);
      return acc;
    },
    {} as Record<string, SeatData[]>
  );

  const handleSeatClick = (seatId: string) => {
    if (pricingMode !== "advanced") return;

    setSelectedSeats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(seatId)) {
        newSet.delete(seatId);
      } else {
        newSet.add(seatId);
      }
      return newSet;
    });
  };

  const handleBulkPriceSet = () => {
    if (!bulkPrice || selectedSeats.size === 0) {
      toast({
        title: "Validation Error",
        description: "Please select seats and enter a price",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(bulkPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    const newPricing = new Map(seatPricing);
    selectedSeats.forEach((seatId) => {
      newPricing.set(seatId, price);
    });

    setSeatPricing(newPricing);
    setSelectedSeats(new Set());
    setBulkPrice("");

    // Update parent component
    const pricingArray = Array.from(newPricing.entries()).map(
      ([seat_id, price]) => ({
        seat_id,
        price,
      })
    );
    onAdvancedPricingChange(pricingArray);

    toast({
      title: "Success",
      description: `Pricing set for ${selectedSeats.size} seats`,
    });
  };

  const handleCategoryBulkPrice = (category: string, price: number) => {
    const newPricing = new Map(seatPricing);
    auditoriumSeats
      .filter((seat) => seat.category === category)
      .forEach((seat) => {
        newPricing.set(seat.id, price);
      });

    setSeatPricing(newPricing);

    // Update parent component
    const pricingArray = Array.from(newPricing.entries()).map(
      ([seat_id, price]) => ({
        seat_id,
        price,
      })
    );
    onAdvancedPricingChange(pricingArray);

    toast({
      title: "Success",
      description: `Pricing set for all ${category} seats`,
    });
  };

  const getSeatIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "premium":
        return <Star className="h-3 w-3" />;
      case "vip":
        return <Crown className="h-3 w-3" />;
      default:
        return <Circle className="h-3 w-3" />;
    }
  };

  const getSeatColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "premium":
        return "bg-blue-500 hover:bg-blue-600";
      case "vip":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getSeatPrice = (seatId: string) => {
    return seatPricing.get(seatId) || 0;
  };

  const isSeatSelected = (seatId: string) => {
    return selectedSeats.has(seatId);
  };

  const getPricingSummary = () => {
    const summary = {
      totalSeats: auditoriumSeats.length,
      pricedSeats: seatPricing.size,
      totalRevenue: Array.from(seatPricing.values()).reduce(
        (sum, price) => sum + price,
        0
      ),
      averagePrice:
        seatPricing.size > 0
          ? Array.from(seatPricing.values()).reduce(
              (sum, price) => sum + price,
              0
            ) / seatPricing.size
          : 0,
    };
    return summary;
  };

  const summary = getPricingSummary();

  return (
    <div className="space-y-6">
      {/* Pricing Mode Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Pricing Mode</h3>
          <p className="text-sm text-muted-foreground">
            Choose how you want to set pricing for this show
          </p>
        </div>
        <Tabs value={pricingMode} onValueChange={onPricingModeChange}>
          <TabsList>
            <TabsTrigger value="simple" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Simple
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Separator />

      {/* Simple Pricing Mode */}
      {pricingMode === "simple" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Simple Category-Based Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">
                    Simple Pricing Mode
                  </p>
                  <p className="text-blue-700 mt-1">
                    Set one price per seat category. All seats of the same
                    category will have the same price.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {seatCategories.map((category) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getSeatIcon(category)}
                    <Label className="font-medium capitalize">
                      {category} Seats
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">₹ </span>
                    <Input
                      type="number"
                      min="0"
                      step="10"
                      value={simplePricing[category.toLowerCase()] || ""}
                      onChange={(e) =>
                        onSimplePricingChange(
                          category.toLowerCase(),
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="Enter price"
                      className="text-lg font-medium"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {
                      auditoriumSeats.filter(
                        (seat) => seat.category === category
                      ).length
                    }{" "}
                    seats
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Preview */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Pricing Preview</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {seatCategories.map((category) => {
                  const price = simplePricing[category.toLowerCase()] || 0;
                  const seatCount = auditoriumSeats.filter(
                    (seat) => seat.category === category
                  ).length;
                  return (
                    <div key={category} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">
                        {category}:
                      </span>
                      <span>
                        Rs {price} × {seatCount}
                      </span>
                    </div>
                  );
                })}
                <div className="col-span-2 md:col-span-4 pt-2 border-t">
                  <div className="flex justify-between font-medium">
                    <span>Total Revenue:</span>
                    <span>
                      Rs 
                      {seatCategories.reduce((sum, category) => {
                        const price =
                          simplePricing[category.toLowerCase()] || 0;
                        const seatCount = auditoriumSeats.filter(
                          (seat) => seat.category === category
                        ).length;
                        return sum + price * seatCount;
                      }, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Pricing Mode */}
      {pricingMode === "advanced" && (
        <div className="space-y-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Advanced Per-Seat Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900">
                      Advanced Pricing Mode
                    </p>
                    <p className="text-amber-700 mt-1">
                      Set individual prices for each seat. Click on seats to
                      select them, then set a price.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bulk Operations */}
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Selected Seats:</Label>
                  <Badge variant="secondary">{selectedSeats.size}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Price (Rs ):</Label>
                  <Input
                    type="number"
                    min="0"
                    step="10"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    placeholder="Enter price"
                    className="w-24"
                  />
                </div>
                <Button
                  onClick={handleBulkPriceSet}
                  disabled={selectedSeats.size === 0 || !bulkPrice}
                  size="sm"
                >
                  Set Price
                </Button>
              </div>

              {/* Category Bulk Operations */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Quick Category Pricing:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {seatCategories.map((category) => (
                    <Button
                      key={category}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const price = prompt(
                          `Enter price for all ${category} seats:`
                        );
                        if (price && !isNaN(parseFloat(price))) {
                          handleCategoryBulkPrice(category, parseFloat(price));
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      {getSeatIcon(category)}
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seat Map Visualization */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Seat Map
                </CardTitle>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded"></div>
                    <span>Regular</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Premium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span>VIP</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Screen */}
                <div className="text-center">
                  <div className="inline-block bg-gray-200 px-8 py-2 rounded text-sm font-medium">
                    SCREEN
                  </div>
                </div>

                {/* Seat Rows */}
                <div className="space-y-2">
                  {Object.entries(seatsByRow)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([row, seats]) => (
                      <div key={row} className="flex items-center gap-2">
                        <div className="w-8 text-sm font-medium text-center">
                          {row}
                        </div>
                        <div className="flex gap-1">
                          {seats
                            .sort((a, b) => a.number - b.number)
                            .map((seat) => {
                              const isSelected = isSeatSelected(seat.id);
                              const price = getSeatPrice(seat.id);
                              return (
                                <button
                                  key={seat.id}
                                  onClick={() => handleSeatClick(seat.id)}
                                  className={`
                                    w-8 h-8 rounded text-xs font-medium transition-all
                                    ${getSeatColor(seat.category)}
                                    ${isSelected ? "ring-2 ring-yellow-400 ring-offset-2" : ""}
                                    ${price > 0 ? "opacity-100" : "opacity-60"}
                                    hover:scale-105
                                  `}
                                  title={`${seat.category} - Row ${seat.row}, Seat ${seat.number}${price > 0 ? ` - Rs ${price}` : ""}`}
                                >
                                  {seat.number}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-muted/50 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {summary.totalSeats}
                  </div>
                  <div className="text-muted-foreground">Total Seats</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {summary.pricedSeats}
                  </div>
                  <div className="text-muted-foreground">Priced Seats</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded">
                  <div className="text-2xl font-bold text-purple-600">
                    Rs {summary.totalRevenue}
                  </div>
                  <div className="text-muted-foreground">Total Revenue</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded">
                  <div className="text-2xl font-bold text-orange-600">
                    Rs {Math.round(summary.averagePrice)}
                  </div>
                  <div className="text-muted-foreground">Avg Price</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

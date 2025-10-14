"use client";

import { useState, useRef, useEffect } from "react";
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
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Eye,
  ZoomIn,
  ZoomOut,
  Move,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  bulkUpdateBaseSeatPricing,
  getAuditoriumPricingPreview,
} from "@/lib/superadmin";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SeatMapRow {
  row: string;
  seats: number[];
  type: "vip" | "diamond" | "platinum" | "gold" | "silver";
  x_position?: number;
  y_position?: number;
}

interface AuditoriumConfiguratorProps {
  request: any;
  onSave: (seatMapData: any) => void;
  isSaving: boolean;
  initialSeats?: Array<{
    row: string;
    number: number;
    category: "vip" | "diamond" | "platinum" | "gold" | "silver";
  }>;
  justSaved?: boolean;
  isEditing?: boolean;
}

export function AuditoriumConfigurator({
  request,
  onSave,
  isSaving,
  initialSeats,
  justSaved,
  isEditing,
}: AuditoriumConfiguratorProps) {
  const { toast } = useToast();
  const [seatMap, setSeatMap] = useState<SeatMapRow[]>([]);
  const [newRowLetter, setNewRowLetter] = useState("");
  const [newRowSeats, setNewRowSeats] = useState("");
  const [newRowType, setNewRowType] = useState<"vip" | "diamond" | "platinum" | "gold" | "silver">(
    "silver"
  );
  const [selectedSeatType, setSelectedSeatType] = useState<
    "vip" | "diamond" | "platinum" | "gold" | "silver"
  >("silver");
  const [isBlueprintVisible, setIsBlueprintVisible] = useState(true);
  const [blueprintScale, setBlueprintScale] = useState(1);
  const [blueprintPosition, setBlueprintPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [saveCooldown, setSaveCooldown] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmEmptySaveOpen, setConfirmEmptySaveOpen] = useState(false);
  const [auditoriumName, setAuditoriumName] = useState("");
  const [bulkPriceOpen, setBulkPriceOpen] = useState(false);
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [bulkCategories, setBulkCategories] = useState<string[]>([]);
  const [bulkRows, setBulkRows] = useState<string[]>([]);
  const [pricingPreview, setPricingPreview] = useState<any[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<
    Array<{ row: string; number: number }>
  >([]);
  const [perSeatPrice, setPerSeatPrice] = useState<string>("");

  const isSeatSelected = (row: string, number: number) =>
    selectedSeats.some((s) => s.row === row && s.number === number);

  const blueprintRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize with existing seats if provided; if none, keep empty when editing;
  // only auto-seed a default when initialSeats is undefined (create-from-request flow).
  useEffect(() => {
    if (Array.isArray(initialSeats) && initialSeats.length > 0) {
      const grouped: Record<
        string,
        { type: "vip" | "diamond" | "platinum" | "gold" | "silver"; seats: number[] }
      > = {};
      for (const s of initialSeats) {
        const key = s.row;
        if (!grouped[key]) grouped[key] = { type: s.category, seats: [] };
        grouped[key].seats.push(s.number);
      }
      const rows: SeatMapRow[] = Object.keys(grouped)
        .sort()
        .map((row) => ({
          row,
          seats: grouped[row].seats.sort((a, b) => a - b),
          type: grouped[row].type,
        }));
      setSeatMap(rows);
      return;
    }
    if (initialSeats === undefined && seatMap.length === 0) {
      setSeatMap([
        { row: "A", seats: [1, 2, 3, 4, 5], type: "vip" },
        { row: "B", seats: [1, 2, 3, 4, 5, 6], type: "diamond" },
        { row: "C", seats: [1, 2, 3, 4, 5, 6, 7], type: "platinum" },
        { row: "D", seats: [1, 2, 3, 4, 5, 6, 7, 8], type: "gold" },
        { row: "E", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9], type: "silver" },
      ]);
    }
  }, [initialSeats]);

  // When parent signals a successful save, show a toast and briefly disable the button
  useEffect(() => {
    if (justSaved) {
      try {
        toast({ title: "Saved", description: "Configuration updated" });
      } catch {}
      setSaveCooldown(true);
      const t = setTimeout(() => setSaveCooldown(false), 1200);
      return () => clearTimeout(t);
    }
  }, [justSaved, toast]);

  // Initialize editable auditorium name
  useEffect(() => {
    const nameFromRequest =
      (request && (request.name || request?.auditorium_name)) || "";
    if (nameFromRequest) setAuditoriumName(nameFromRequest);
    else if (!isEditing) {
      setAuditoriumName(
        `${request?.theatre?.name || "New"} - Auditorium ${new Date().getFullYear()}`
      );
    }
  }, [request, isEditing]);

  const getSeatButtonClass = (type: "vip" | "diamond" | "platinum" | "gold" | "silver") => {
    const baseClass =
      "w-6 h-6 text-xs font-medium rounded-sm border-2 transition-all cursor-pointer hover:scale-110";
    switch (type) {
      case "vip":
        return `${baseClass} bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-500 text-yellow-900 shadow-lg`;
      case "diamond":
        return `${baseClass} bg-gradient-to-br from-purple-400 to-purple-600 border-purple-500 text-white shadow-lg`;
      case "platinum":
        return `${baseClass} bg-gradient-to-br from-gray-300 to-gray-500 border-gray-400 text-gray-900 shadow-md`;
      case "gold":
        return `${baseClass} bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-400 text-yellow-900 shadow-md`;
      case "silver":
        return `${baseClass} bg-gradient-to-br from-gray-400 to-gray-600 border-gray-500 text-white`;
      default:
        return `${baseClass} bg-secondary border-border text-secondary-foreground`;
    }
  };

  const addRow = () => {
    if (!newRowLetter || !newRowSeats) {
      toast({
        title: "Validation Error",
        description: "Please provide both row letter and seat numbers",
      });
      return;
    }

    const seats = newRowSeats
      .split(",")
      .map((s) => Number.parseInt(s.trim()))
      .filter((n) => !isNaN(n));

    if (seats.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please provide valid seat numbers",
      });
      return;
    }

    const newRow: SeatMapRow = {
      row: newRowLetter.toUpperCase(),
      seats: seats,
      type: newRowType,
    };

    setSeatMap((prev) => [...prev, newRow]);
    setNewRowLetter("");
    setNewRowSeats("");
    setNewRowType("silver");

    toast({
      title: "Success",
      description: `Added row ${newRowLetter.toUpperCase()} with ${seats.length} seats`,
    });
  };

  const removeRow = (rowIndex: number) => {
    const rowToRemove = seatMap[rowIndex];
    setSeatMap((prev) => prev.filter((_, index) => index !== rowIndex));

    toast({
      title: "Row Removed",
      description: `Removed row ${rowToRemove.row}`,
    });
  };

  const updateRowType = (
    rowIndex: number,
    type: "vip" | "diamond" | "platinum" | "gold" | "silver"
  ) => {
    setSeatMap((prev) =>
      prev.map((row, index) => (index === rowIndex ? { ...row, type } : row))
    );
  };

  const handleSeatClick = (rowIndex: number, seatIndex: number) => {
    const row = seatMap[rowIndex];
    const number = row.seats[seatIndex];
    if (selectionMode && isEditing) {
      setSelectedSeats((prev) => {
        const exists = prev.some(
          (s) => s.row === row.row && s.number === number
        );
        if (exists)
          return prev.filter(
            (s) => !(s.row === row.row && s.number === number)
          );
        return [...prev, { row: row.row, number }];
      });
      return;
    }
    setSeatMap((prev) =>
      prev.map((r, index) =>
        index === rowIndex ? { ...r, type: selectedSeatType } : r
      )
    );
  };

  const saveSeatMap = () => {
    // Allow empty save when editing an existing auditorium (to clear seats)
    if (seatMap.length === 0 && !isEditing) {
      toast({
        title: "Validation Error",
        description: "Please add at least one row of seats",
      });
      return;
    }
    // If editing and empty, confirm deletion of all seats
    if (seatMap.length === 0 && isEditing) {
      setConfirmEmptySaveOpen(true);
      return;
    }

    // Transform seat map data for backend
    const seatData = seatMap.flatMap((row, rowIndex) =>
      row.seats.map((seatNumber, seatIndex) => ({
        row: row.row,
        number: seatNumber,
        category: row.type,
        x_position: seatIndex * 30 + 50, // Basic positioning
        y_position: rowIndex * 40 + 100, // Basic positioning
        is_active: true,
      }))
    );

    const auditoriumData = {
      request_id: request.id,
      theatre_id: request.theatre_id,
      name:
        auditoriumName || `${request.theatre?.name} - Auditorium ${Date.now()}`,
      seat_map: seatData, // can be [] when clearing
      total_seats: seatData.length,
      configuration: {
        rows: seatMap.length,
        seat_categories: {
          vip: seatMap
            .filter((row) => row.type === "vip")
            .reduce((sum, row) => sum + row.seats.length, 0),
          diamond: seatMap
            .filter((row) => row.type === "diamond")
            .reduce((sum, row) => sum + row.seats.length, 0),
          platinum: seatMap
            .filter((row) => row.type === "platinum")
            .reduce((sum, row) => sum + row.seats.length, 0),
          gold: seatMap
            .filter((row) => row.type === "gold")
            .reduce((sum, row) => sum + row.seats.length, 0),
          silver: seatMap
            .filter((row) => row.type === "silver")
            .reduce((sum, row) => sum + row.seats.length, 0),
        },
      },
    };

    onSave(auditoriumData);
  };

  const resetSeatMap = () => {
    setSeatMap([]);
    toast({
      title: "Reset",
      description: "All seats cleared. Click Save to apply.",
    });
  };

  // Blueprint interaction handlers
  const handleBlueprintMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - blueprintPosition.x,
      y: e.clientY - blueprintPosition.y,
    });
  };

  const handleBlueprintMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setBlueprintPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleBlueprintMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setBlueprintScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setBlueprintScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const totalSeats = seatMap.reduce(
    (total, row) => total + row.seats.length,
    0
  );
  const vipSeats = seatMap
    .filter((row) => row.type === "vip")
    .reduce((total, row) => total + row.seats.length, 0);
  const diamondSeats = seatMap
    .filter((row) => row.type === "diamond")
    .reduce((total, row) => total + row.seats.length, 0);
  const platinumSeats = seatMap
    .filter((row) => row.type === "platinum")
    .reduce((total, row) => total + row.seats.length, 0);
  const goldSeats = seatMap
    .filter((row) => row.type === "gold")
    .reduce((total, row) => total + row.seats.length, 0);
  const silverSeats = seatMap
    .filter((row) => row.type === "silver")
    .reduce((total, row) => total + row.seats.length, 0);

  return (
    <div className="space-y-6">
      {/* Configuration Stats */}
      <div className="grid grid-cols-6 gap-4">
        <Card className="bg-secondary/50 border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{totalSeats}</div>
            <p className="text-sm text-muted-foreground">Total Seats</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50 border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{vipSeats}</div>
            <p className="text-sm text-muted-foreground">VIP Seats</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50 border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {diamondSeats}
            </div>
            <p className="text-sm text-muted-foreground">Diamond Seats</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50 border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">
              {platinumSeats}
            </div>
            <p className="text-sm text-muted-foreground">Platinum Seats</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50 border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {goldSeats}
            </div>
            <p className="text-sm text-muted-foreground">Gold Seats</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50 border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {silverSeats}
            </div>
            <p className="text-sm text-muted-foreground">Silver Seats</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Configuration Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blueprint Viewer */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Blueprint Reference</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBlueprintVisible(!isBlueprintVisible)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {isBlueprintVisible ? "Hide" : "Show"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              ref={blueprintRef}
              className="relative w-full h-96 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
              onMouseDown={handleBlueprintMouseDown}
              onMouseMove={handleBlueprintMouseMove}
              onMouseUp={handleBlueprintMouseUp}
              onMouseLeave={handleBlueprintMouseUp}
            >
              {request.blueprint_url && isBlueprintVisible ? (
                <img
                  src={request.blueprint_url}
                  alt="Auditorium Blueprint"
                  className="absolute inset-0 w-full h-full object-contain cursor-move"
                  style={{
                    transform: `translate(${blueprintPosition.x}px, ${blueprintPosition.y}px) scale(${blueprintScale})`,
                    transformOrigin: "top left",
                  }}
                  draggable={false}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Move className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No blueprint available</p>
                    <p className="text-sm">
                      Use the seat editor to create your layout
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Drag to move • Use zoom controls • Click and drag to reposition
            </div>
          </CardContent>
        </Card>

        {/* Seat Map Editor */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Seat Map Editor</CardTitle>
              <div className="flex items-center gap-2 w-full max-w-md">
                <Label htmlFor="audName" className="text-sm whitespace-nowrap">
                  Auditorium Name
                </Label>
                <Input
                  id="audName"
                  value={auditoriumName}
                  onChange={(e) => setAuditoriumName(e.target.value)}
                  placeholder="Enter auditorium name"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Screen Indicator */}
            <div className="flex justify-center">
              <div className="w-3/4 h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full opacity-60"></div>
            </div>
            <div className="text-center text-sm text-muted-foreground mb-8">
              SCREEN
            </div>

            {/* Seat Type Selector */}
            <div className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
              <Label>Paint Tool:</Label>
              <Select
                value={selectedSeatType}
                onValueChange={(value: "vip" | "diamond" | "platinum" | "gold" | "silver") =>
                  setSelectedSeatType(value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="diamond">Diamond</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                </SelectContent>
              </Select>
              {isEditing && (
                <div className="flex items-center gap-2 ml-2">
                  <Label className="text-sm">Select seats</Label>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selectionMode}
                    onChange={(e) => {
                      setSelectionMode(e.target.checked);
                      if (!e.target.checked) setSelectedSeats([]);
                    }}
                  />
                  {selectionMode && (
                    <span className="text-xs text-muted-foreground">
                      {selectedSeats.length} selected
                    </span>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <div
                  className={`w-4 h-4 rounded border-2 ${getSeatButtonClass("vip").split(" ").slice(2, 4).join(" ")}`}
                ></div>
                <div
                  className={`w-4 h-4 rounded border-2 ${getSeatButtonClass("diamond").split(" ").slice(2, 4).join(" ")}`}
                ></div>
                <div
                  className={`w-4 h-4 rounded border-2 ${getSeatButtonClass("platinum").split(" ").slice(2, 4).join(" ")}`}
                ></div>
                <div
                  className={`w-4 h-4 rounded border-2 ${getSeatButtonClass("gold").split(" ").slice(2, 4).join(" ")}`}
                ></div>
                <div
                  className={`w-4 h-4 rounded border-2 ${getSeatButtonClass("silver").split(" ").slice(2, 4).join(" ")}`}
                ></div>
              </div>
            </div>

            {/* Seat Map */}
            <div ref={canvasRef} className="space-y-3 max-h-96 overflow-y-auto">
              {seatMap.map((rowData, rowIndex) => (
                <div key={rowIndex} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          rowData.type === "vip"
                            ? "default"
                            : rowData.type === "diamond"
                              ? "secondary"
                              : rowData.type === "platinum"
                                ? "outline"
                                : rowData.type === "gold"
                                  ? "default"
                                  : "outline"
                        }
                      >
                        Row {rowData.row} - {rowData.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {rowData.seats.length} seats
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={rowData.type}
                        onValueChange={(value: "vip" | "diamond" | "platinum" | "gold" | "silver") =>
                          updateRowType(rowIndex, value)
                        }
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vip">VIP</SelectItem>
                          <SelectItem value="diamond">Diamond</SelectItem>
                          <SelectItem value="platinum">Platinum</SelectItem>
                          <SelectItem value="gold">Gold</SelectItem>
                          <SelectItem value="silver">Silver</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(rowIndex)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 text-center font-medium text-muted-foreground">
                      {rowData.row}
                    </div>
                    <div className="flex gap-1">
                      {rowData.seats.map((seatNumber, seatIndex) => (
                        <Tooltip key={`${rowData.row}-${seatNumber}`}>
                          <TooltipTrigger asChild>
                            <div
                              className={
                                getSeatButtonClass(rowData.type) +
                                (selectionMode &&
                                isEditing &&
                                isSeatSelected(rowData.row, seatNumber)
                                  ? " ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                                  : selectionMode && isEditing
                                    ? " outline outline-1 outline-dashed outline-primary/40"
                                    : "")
                              }
                              onClick={() =>
                                handleSeatClick(rowIndex, seatIndex)
                              }
                              title={
                                selectionMode && isEditing
                                  ? isSeatSelected(rowData.row, seatNumber)
                                    ? "Selected"
                                    : "Click to select"
                                  : `Click to change to ${selectedSeatType}`
                              }
                              aria-selected={
                                selectionMode &&
                                isEditing &&
                                isSeatSelected(rowData.row, seatNumber)
                              }
                            >
                              {seatNumber}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={4}>
                            <SeatPriceHint
                              row={rowData.row}
                              number={seatNumber}
                              pricingPreview={pricingPreview}
                            />
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                    <div className="w-8 text-center font-medium text-muted-foreground">
                      {rowData.row}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Row */}
            <Card className="bg-secondary/30 border-border">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Add New Row</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="rowLetter">Row Letter</Label>
                    <Input
                      id="rowLetter"
                      value={newRowLetter}
                      onChange={(e) => setNewRowLetter(e.target.value)}
                      placeholder="G"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seats">Seat Numbers</Label>
                    <Input
                      id="seats"
                      value={newRowSeats}
                      onChange={(e) => setNewRowSeats(e.target.value)}
                      placeholder="1,2,3,4,5,6,7,8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rowType">Seat Type</Label>
                    <Select
                      value={newRowType}
                      onValueChange={(value: "vip" | "diamond" | "platinum" | "gold" | "silver") =>
                        setNewRowType(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="diamond">Diamond</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addRow} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Row
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={saveSeatMap}
                disabled={isSaving || saveCooldown}
                className="cinema-glow"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving
                  ? "Saving..."
                  : saveCooldown
                    ? "Saved"
                    : "Save Configuration"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmResetOpen(true)}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Layout
              </Button>
              <Button variant="outline" onClick={() => setBulkPriceOpen(true)}>
                Set Bulk Pricing
              </Button>
            </div>
            {isEditing && selectionMode && (
              <div className="mt-3 p-3 border rounded-md bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="text-sm font-medium text-blue-900">
                    Base Pricing Mode
                  </div>
                </div>
                <p className="text-xs text-blue-700 mb-3">
                  Set base prices for seats. These will apply to all shows
                  unless overridden by show-specific pricing.
                </p>
                <div className="flex items-center gap-3">
                  <div className="text-sm">Per-seat price (INR)</div>
                  <Input
                    className="max-w-[140px]"
                    placeholder="e.g. 320"
                    value={perSeatPrice}
                    onChange={(e) => setPerSeatPrice(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    disabled={selectedSeats.length === 0 || !perSeatPrice}
                    onClick={async () => {
                      try {
                        const auditoriumId =
                          (request && (request.id || request.auditorium_id)) ||
                          null;
                        if (!auditoriumId) return;
                        const idMap = new Map<string, string>();
                        (initialSeats || []).forEach((s: any) => {
                          idMap.set(
                            `${String(s.row)}-${Number(s.number)}`,
                            s.id
                          );
                        });
                        const seat_ids = selectedSeats
                          .map((s) => idMap.get(`${s.row}-${s.number}`))
                          .filter(Boolean) as string[];
                        if (seat_ids.length === 0) {
                          toast({
                            title: "No matching seats",
                            description:
                              "Save configuration first to get seat IDs, then set per-seat prices.",
                          });
                          return;
                        }
                        await bulkUpdateBaseSeatPricing(auditoriumId, {
                          filters: { seat_ids },
                          price: Number(perSeatPrice),
                        });
                        const preview =
                          await getAuditoriumPricingPreview(auditoriumId);
                        setPricingPreview(preview?.seats || []);
                        toast({
                          title: "Per-seat pricing applied",
                          description: `${seat_ids.length} seat(s) updated`,
                        });
                        setSelectedSeats([]);
                      } catch (e: any) {
                        toast({
                          title: "Error",
                          description:
                            e?.message || "Failed to set per-seat pricing",
                        });
                      }
                    }}
                  >
                    Apply to selected ({selectedSeats.length})
                  </Button>
                  <Button variant="ghost" onClick={() => setSelectedSeats([])}>
                    Clear selection
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Bulk Pricing Dialog */}
      <Dialog open={bulkPriceOpen} onOpenChange={setBulkPriceOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Pricing</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categories</Label>
                <Input
                  placeholder="vip,diamond,platinum,gold,silver"
                  value={bulkCategories.join(",")}
                  onChange={(e) =>
                    setBulkCategories(
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </div>
              <div>
                <Label>Rows</Label>
                <Input
                  placeholder="A,B,C"
                  value={bulkRows.join(",")}
                  onChange={(e) =>
                    setBulkRows(
                      e.target.value
                        .toUpperCase()
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </div>
            </div>
            <div>
              <Label>Price (INR)</Label>
              <Input
                placeholder="e.g. 300"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const auditoriumId = request?.id || request?.auditorium_id;
                    if (!auditoriumId) return;
                    await bulkUpdateBaseSeatPricing(auditoriumId, {
                      filters: {
                        categories: bulkCategories.length
                          ? bulkCategories
                          : undefined,
                        rows: bulkRows.length ? bulkRows : undefined,
                      },
                      price: Number(bulkPrice),
                    });
                    const preview =
                      await getAuditoriumPricingPreview(auditoriumId);
                    setPricingPreview(preview?.seats || []);
                    toast({
                      title: "Pricing updated",
                      description: "Base pricing applied",
                    });
                  } catch (e: any) {
                    toast({
                      title: "Error",
                      description: e?.message || "Failed to set pricing",
                    });
                  }
                }}
              >
                Apply
              </Button>
              <Button variant="ghost" onClick={() => setBulkPriceOpen(false)}>
                Close
              </Button>
            </div>
            {pricingPreview && pricingPreview.length > 0 && (
              <div className="max-h-48 overflow-y-auto text-xs mt-2 border rounded p-2">
                {pricingPreview.slice(0, 50).map((p) => (
                  <div key={p.seat_id} className="flex justify-between">
                    <span>
                      {p.row}
                      {p.number} ({p.category})
                    </span>
                    <span>
                      AED {p.base_price ?? "-"}
                      {p.show_price ? ` (show AED ${p.show_price})` : ""}
                    </span>
                  </div>
                ))}
                {pricingPreview.length > 50 && (
                  <div className="text-muted-foreground">
                    Showing first 50...
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Confirm Reset Dialog */}
      <Dialog open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Clear all seats?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will remove all rows from the editor. Click Save afterwards to
            apply the change.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmResetOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmResetOpen(false);
                resetSeatMap();
              }}
            >
              Clear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Confirm Empty Save Dialog */}
      <Dialog
        open={confirmEmptySaveOpen}
        onOpenChange={setConfirmEmptySaveOpen}
      >
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Save empty layout?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Saving will delete all seats for this auditorium. You can rebuild
            later.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmEmptySaveOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmEmptySaveOpen(false);
                onSave({
                  request_id: request.id,
                  theatre_id: request.theatre_id,
                  name:
                    auditoriumName ||
                    `${request.theatre?.name} - Auditorium ${Date.now()}`,
                  seat_map: [],
                  total_seats: 0,
                  configuration: {
                    rows: 0,
                    seat_categories: { vip: 0, diamond: 0, platinum: 0, gold: 0, silver: 0 },
                  },
                });
              }}
            >
              Delete seats
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SeatPriceHint({
  row,
  number,
  pricingPreview,
}: {
  row: string;
  number: number;
  pricingPreview: any[];
}) {
  const match = Array.isArray(pricingPreview)
    ? pricingPreview.find(
        (p) => p.row === row && Number(p.number) === Number(number)
      )
    : null;
  if (!match)
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium">
          Row {row}
          {number}
        </span>
        <span className="text-muted-foreground">No price set</span>
      </div>
    );
  return (
    <div className="flex items-center gap-3">
      <span className="font-medium">
        Row {row}
        {number}
      </span>
      <span>AED {match.show_price ?? match.base_price ?? "-"}</span>
      {match.show_price != null && (
        <span className="text-xs text-muted-foreground">(show override)</span>
      )}
    </div>
  );
}

function SeatPriceHintHost() {
  return null;
}

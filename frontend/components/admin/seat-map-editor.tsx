"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Save, RotateCcw } from "lucide-react"

interface SeatMapRow {
  row: string
  seats: number[]
  type: "premium" | "regular"
}

const initialSeatMap: SeatMapRow[] = [
  { row: "A", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], type: "premium" },
  { row: "B", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], type: "premium" },
  { row: "C", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], type: "regular" },
  { row: "D", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], type: "regular" },
  { row: "E", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], type: "regular" },
  { row: "F", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], type: "regular" },
]

export function SeatMapEditor() {
  const [seatMap, setSeatMap] = useState<SeatMapRow[]>(initialSeatMap)
  const [selectedScreen, setSelectedScreen] = useState("screen1")
  const [newRowLetter, setNewRowLetter] = useState("")
  const [newRowSeats, setNewRowSeats] = useState("")
  const [newRowType, setNewRowType] = useState<"premium" | "regular">("regular")

  const getSeatButtonClass = (type: "premium" | "regular") => {
    const baseClass = "w-6 h-6 text-xs font-medium rounded-sm border-2 transition-all"
    if (type === "premium") {
      return `${baseClass} bg-accent/20 border-accent/40 text-accent-foreground`
    }
    return `${baseClass} bg-secondary border-border text-secondary-foreground`
  }

  const addRow = () => {
    if (!newRowLetter || !newRowSeats) return

    const seats = newRowSeats
      .split(",")
      .map((s) => Number.parseInt(s.trim()))
      .filter((n) => !isNaN(n))
    if (seats.length === 0) return

    const newRow: SeatMapRow = {
      row: newRowLetter.toUpperCase(),
      seats: seats,
      type: newRowType,
    }

    setSeatMap((prev) => [...prev, newRow])
    setNewRowLetter("")
    setNewRowSeats("")
    setNewRowType("regular")
  }

  const removeRow = (rowIndex: number) => {
    setSeatMap((prev) => prev.filter((_, index) => index !== rowIndex))
  }

  const updateRowType = (rowIndex: number, type: "premium" | "regular") => {
    setSeatMap((prev) => prev.map((row, index) => (index === rowIndex ? { ...row, type } : row)))
  }

  const saveSeatMap = () => {
    console.log("Saving seat map for", selectedScreen, ":", seatMap)
    // In real app, this would make an API call
  }

  const resetSeatMap = () => {
    setSeatMap(initialSeatMap)
  }

  const totalSeats = seatMap.reduce((total, row) => total + row.seats.length, 0)
  const premiumSeats = seatMap
    .filter((row) => row.type === "premium")
    .reduce((total, row) => total + row.seats.length, 0)
  const regularSeats = totalSeats - premiumSeats

  return (
    <div className="space-y-6">
      {/* Screen Selection */}
      <div className="flex items-center gap-4">
        <Label htmlFor="screen">Select Screen:</Label>
        <Select value={selectedScreen} onValueChange={setSelectedScreen}>
          <SelectTrigger className="w-48 bg-input border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="screen1">Screen 1</SelectItem>
            <SelectItem value="screen2">Screen 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Seat Map Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-secondary/50 border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{totalSeats}</div>
            <p className="text-sm text-muted-foreground">Total Seats</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50 border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{premiumSeats}</div>
            <p className="text-sm text-muted-foreground">Premium Seats</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50 border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{regularSeats}</div>
            <p className="text-sm text-muted-foreground">Regular Seats</p>
          </CardContent>
        </Card>
      </div>

      {/* Seat Map Editor */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Seat Map Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Screen Indicator */}
          <div className="flex justify-center">
            <div className="w-3/4 h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full opacity-60"></div>
          </div>
          <div className="text-center text-sm text-muted-foreground mb-8">SCREEN</div>

          {/* Seat Map */}
          <div className="space-y-3">
            {seatMap.map((rowData, rowIndex) => (
              <div key={rowIndex} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={rowData.type === "premium" ? "default" : "secondary"}>
                      Row {rowData.row} - {rowData.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{rowData.seats.length} seats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={rowData.type}
                      onValueChange={(value: "premium" | "regular") => updateRowType(rowIndex, value)}
                    >
                      <SelectTrigger className="w-32 h-8 bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
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
                  <div className="w-8 text-center font-medium text-muted-foreground">{rowData.row}</div>
                  <div className="flex gap-1">
                    {rowData.seats.map((seatNumber) => (
                      <div key={`${rowData.row}-${seatNumber}`} className={getSeatButtonClass(rowData.type)}>
                        {seatNumber}
                      </div>
                    ))}
                  </div>
                  <div className="w-8 text-center font-medium text-muted-foreground">{rowData.row}</div>
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
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seats">Seat Numbers</Label>
                  <Input
                    id="seats"
                    value={newRowSeats}
                    onChange={(e) => setNewRowSeats(e.target.value)}
                    placeholder="1,2,3,4,5,6,7,8"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rowType">Seat Type</Label>
                  <Select value={newRowType} onValueChange={(value: "premium" | "regular") => setNewRowType(value)}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
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
            <Button onClick={saveSeatMap} className="cinema-glow">
              <Save className="h-4 w-4 mr-2" />
              Save Seat Map
            </Button>
            <Button variant="outline" onClick={resetSeatMap}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

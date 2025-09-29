"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Save, RotateCcw, Eye, ZoomIn, ZoomOut, Move } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SeatMapRow {
  row: string
  seats: number[]
  type: "premium" | "regular" | "vip"
  x_position?: number
  y_position?: number
}

interface AuditoriumConfiguratorProps {
  request: any
  onSave: (seatMapData: any) => void
  isSaving: boolean
}

export function AuditoriumConfigurator({ request, onSave, isSaving }: AuditoriumConfiguratorProps) {
  const { toast } = useToast()
  const [seatMap, setSeatMap] = useState<SeatMapRow[]>([])
  const [newRowLetter, setNewRowLetter] = useState("")
  const [newRowSeats, setNewRowSeats] = useState("")
  const [newRowType, setNewRowType] = useState<"premium" | "regular" | "vip">("regular")
  const [selectedSeatType, setSelectedSeatType] = useState<"premium" | "regular" | "vip">("regular")
  const [isBlueprintVisible, setIsBlueprintVisible] = useState(true)
  const [blueprintScale, setBlueprintScale] = useState(1)
  const [blueprintPosition, setBlueprintPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  const blueprintRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Initialize with a basic layout if no existing configuration
  useEffect(() => {
    if (seatMap.length === 0) {
      setSeatMap([
        { row: "A", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], type: "vip" },
        { row: "B", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], type: "vip" },
        { row: "C", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], type: "premium" },
        { row: "D", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], type: "premium" },
        { row: "E", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], type: "regular" },
        { row: "F", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], type: "regular" },
      ])
    }
  }, [])

  const getSeatButtonClass = (type: "premium" | "regular" | "vip") => {
    const baseClass = "w-6 h-6 text-xs font-medium rounded-sm border-2 transition-all cursor-pointer hover:scale-110"
    switch (type) {
      case "vip":
        return `${baseClass} bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-500 text-yellow-900 shadow-lg`
      case "premium":
        return `${baseClass} bg-gradient-to-br from-blue-400 to-blue-600 border-blue-500 text-white shadow-md`
      case "regular":
        return `${baseClass} bg-gradient-to-br from-gray-400 to-gray-600 border-gray-500 text-white`
      default:
        return `${baseClass} bg-secondary border-border text-secondary-foreground`
    }
  }

  const addRow = () => {
    if (!newRowLetter || !newRowSeats) {
      toast({
        title: "Validation Error",
        description: "Please provide both row letter and seat numbers"
      })
      return
    }

    const seats = newRowSeats
      .split(",")
      .map((s) => Number.parseInt(s.trim()))
      .filter((n) => !isNaN(n))
    
    if (seats.length === 0) {
      toast({
        title: "Validation Error", 
        description: "Please provide valid seat numbers"
      })
      return
    }

    const newRow: SeatMapRow = {
      row: newRowLetter.toUpperCase(),
      seats: seats,
      type: newRowType,
    }

    setSeatMap((prev) => [...prev, newRow])
    setNewRowLetter("")
    setNewRowSeats("")
    setNewRowType("regular")
    
    toast({
      title: "Success",
      description: `Added row ${newRowLetter.toUpperCase()} with ${seats.length} seats`
    })
  }

  const removeRow = (rowIndex: number) => {
    const rowToRemove = seatMap[rowIndex]
    setSeatMap((prev) => prev.filter((_, index) => index !== rowIndex))
    
    toast({
      title: "Row Removed",
      description: `Removed row ${rowToRemove.row}`
    })
  }

  const updateRowType = (rowIndex: number, type: "premium" | "regular" | "vip") => {
    setSeatMap((prev) => prev.map((row, index) => (index === rowIndex ? { ...row, type } : row)))
  }

  const handleSeatClick = (rowIndex: number, seatIndex: number) => {
    setSeatMap((prev) => prev.map((row, index) => {
      if (index === rowIndex) {
        return { ...row, type: selectedSeatType }
      }
      return row
    }))
  }

  const saveSeatMap = () => {
    if (seatMap.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one row of seats"
      })
      return
    }

    // Transform seat map data for backend
    const seatData = seatMap.flatMap((row, rowIndex) => 
      row.seats.map((seatNumber, seatIndex) => ({
        row: row.row,
        number: seatNumber,
        category: row.type,
        x_position: seatIndex * 30 + 50, // Basic positioning
        y_position: rowIndex * 40 + 100, // Basic positioning
        is_active: true
      }))
    )

    const auditoriumData = {
      request_id: request.id,
      theatre_id: request.theatre_id,
      name: `${request.theatre?.name} - Auditorium ${Date.now()}`, // Generate unique name
      seat_map: seatData,
      total_seats: seatData.length,
      configuration: {
        rows: seatMap.length,
        seat_categories: {
          vip: seatMap.filter(row => row.type === 'vip').reduce((sum, row) => sum + row.seats.length, 0),
          premium: seatMap.filter(row => row.type === 'premium').reduce((sum, row) => sum + row.seats.length, 0),
          regular: seatMap.filter(row => row.type === 'regular').reduce((sum, row) => sum + row.seats.length, 0)
        }
      }
    }

    onSave(auditoriumData)
  }

  const resetSeatMap = () => {
    setSeatMap([])
    toast({
      title: "Reset",
      description: "Seat map has been reset"
    })
  }

  // Blueprint interaction handlers
  const handleBlueprintMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - blueprintPosition.x, y: e.clientY - blueprintPosition.y })
  }

  const handleBlueprintMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setBlueprintPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleBlueprintMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    setBlueprintScale(prev => Math.min(prev + 0.1, 3))
  }

  const handleZoomOut = () => {
    setBlueprintScale(prev => Math.max(prev - 0.1, 0.5))
  }

  const totalSeats = seatMap.reduce((total, row) => total + row.seats.length, 0)
  const vipSeats = seatMap.filter((row) => row.type === "vip").reduce((total, row) => total + row.seats.length, 0)
  const premiumSeats = seatMap.filter((row) => row.type === "premium").reduce((total, row) => total + row.seats.length, 0)
  const regularSeats = seatMap.filter((row) => row.type === "regular").reduce((total, row) => total + row.seats.length, 0)

  return (
    <div className="space-y-6">
      {/* Configuration Stats */}
      <div className="grid grid-cols-4 gap-4">
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
            <div className="text-2xl font-bold text-blue-600">{premiumSeats}</div>
            <p className="text-sm text-muted-foreground">Premium Seats</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50 border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{regularSeats}</div>
            <p className="text-sm text-muted-foreground">Regular Seats</p>
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
                  {isBlueprintVisible ? 'Hide' : 'Show'}
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
                    transformOrigin: 'top left'
                  }}
                  draggable={false}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Move className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No blueprint available</p>
                    <p className="text-sm">Use the seat editor to create your layout</p>
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
            <CardTitle>Seat Map Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Screen Indicator */}
            <div className="flex justify-center">
              <div className="w-3/4 h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full opacity-60"></div>
            </div>
            <div className="text-center text-sm text-muted-foreground mb-8">SCREEN</div>

            {/* Seat Type Selector */}
            <div className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
              <Label>Paint Tool:</Label>
              <Select value={selectedSeatType} onValueChange={(value: "premium" | "regular" | "vip") => setSelectedSeatType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <div className={`w-4 h-4 rounded border-2 ${getSeatButtonClass("regular").split(' ').slice(2, 4).join(' ')}`}></div>
                <div className={`w-4 h-4 rounded border-2 ${getSeatButtonClass("premium").split(' ').slice(2, 4).join(' ')}`}></div>
                <div className={`w-4 h-4 rounded border-2 ${getSeatButtonClass("vip").split(' ').slice(2, 4).join(' ')}`}></div>
              </div>
            </div>

            {/* Seat Map */}
            <div ref={canvasRef} className="space-y-3 max-h-96 overflow-y-auto">
              {seatMap.map((rowData, rowIndex) => (
                <div key={rowIndex} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={rowData.type === "vip" ? "default" : rowData.type === "premium" ? "secondary" : "outline"}>
                        Row {rowData.row} - {rowData.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{rowData.seats.length} seats</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={rowData.type}
                        onValueChange={(value: "premium" | "regular" | "vip") => updateRowType(rowIndex, value)}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
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
                      {rowData.seats.map((seatNumber, seatIndex) => (
                        <div 
                          key={`${rowData.row}-${seatNumber}`} 
                          className={getSeatButtonClass(rowData.type)}
                          onClick={() => handleSeatClick(rowIndex, seatIndex)}
                          title={`Click to change to ${selectedSeatType}`}
                        >
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
                    <Select value={newRowType} onValueChange={(value: "premium" | "regular" | "vip") => setNewRowType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
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
              <Button onClick={saveSeatMap} disabled={isSaving} className="cinema-glow">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </Button>
              <Button variant="outline" onClick={resetSeatMap}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Layout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

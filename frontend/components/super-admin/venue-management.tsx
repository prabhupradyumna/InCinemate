"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, MapPin, Users, DollarSign, Building2, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"

// Mock venues data
const venues = [
  {
    id: "1",
    name: "Downtown Cinema",
    address: "123 Main Street, New York, NY",
    adminName: "John Smith",
    adminEmail: "john@downtowncinema.com",
    screens: 3,
    totalSeats: 320,
    monthlyRevenue: 8420.5,
    status: "active",
    joinedDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Westside Theater",
    address: "456 West Ave, Los Angeles, CA",
    adminName: "Sarah Johnson",
    adminEmail: "sarah@westsidetheater.com",
    screens: 2,
    totalSeats: 200,
    monthlyRevenue: 7230.25,
    status: "active",
    joinedDate: "2024-02-20",
  },
  {
    id: "3",
    name: "Central Plaza Movies",
    address: "789 Central Plaza, Chicago, IL",
    adminName: "Mike Wilson",
    adminEmail: "mike@centralplaza.com",
    screens: 4,
    totalSeats: 480,
    monthlyRevenue: 6890.0,
    status: "pending",
    joinedDate: "2024-03-10",
  },
]

export function VenueManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [newVenue, setNewVenue] = useState({
    name: "",
    address: "",
    adminEmail: "",
    adminName: "",
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/40">Active</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40">Pending</Badge>
      case "suspended":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/40">Suspended</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.adminName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || venue.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateVenue = () => {
    console.log("Creating venue:", newVenue)
    setIsCreateDialogOpen(false)
    setNewVenue({ name: "", address: "", adminEmail: "", adminName: "" })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Venue Management</h2>
          <p className="text-muted-foreground">Manage all venues on the platform</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="cinema-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add Venue
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Add New Venue</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="venueName">Venue Name</Label>
                <Input
                  id="venueName"
                  value={newVenue.name}
                  onChange={(e) => setNewVenue((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venueAddress">Address</Label>
                <Input
                  id="venueAddress"
                  value={newVenue.address}
                  onChange={(e) => setNewVenue((prev) => ({ ...prev, address: e.target.value }))}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminName">Admin Name</Label>
                <Input
                  id="adminName"
                  value={newVenue.adminName}
                  onChange={(e) => setNewVenue((prev) => ({ ...prev, adminName: e.target.value }))}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={newVenue.adminEmail}
                  onChange={(e) => setNewVenue((prev) => ({ ...prev, adminEmail: e.target.value }))}
                  className="bg-input border-border"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateVenue} className="flex-1">
                  Add Venue
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search venues, addresses, or admin names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-input border-border"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-input border-border">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Venues Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>All Venues</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Venue</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVenues.map((venue) => (
                <TableRow key={venue.id} className="border-border">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{venue.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {venue.address}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{venue.adminName}</div>
                      <div className="text-xs text-muted-foreground">{venue.adminEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Building2 className="h-3 w-3" />
                        {venue.screens} screens
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {venue.totalSeats} seats
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-medium text-primary">
                      <DollarSign className="h-3 w-3" />
                      {venue.monthlyRevenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">This month</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(venue.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(venue.joinedDate)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

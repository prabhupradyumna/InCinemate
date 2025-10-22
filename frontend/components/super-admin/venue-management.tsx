"use client";

import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Users,
  DollarSign,
  Building2,
  Eye,
  RefreshCw,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { listTheatres, createTheatre } from "@/lib/superadmin";
import { useToast } from "@/hooks/use-toast";
import { useApiCall } from "@/lib/hooks";

export function VenueManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Fetch real data
  const {
    data: theatres,
    loading: theatresLoading,
    execute: refreshTheatres,
  } = useApiCall(listTheatres, []);

  const [newVenue, setNewVenue] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    postal_code: "",
    contact_phone: "",
    contact_email: "",
    owner_name: "",
    tax_rate_percent: 18,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/40">
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40">
            Pending
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/40">
            Suspended
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Map theatres to venues for display
  const venues = (theatres || []).map((theatre: any) => ({
    id: theatre.id,
    name: theatre.name,
    address: theatre.address || "No address",
    city: theatre.city || "Unknown",
    state: theatre.state || "",
    country: theatre.country || "India",
    postal_code: theatre.postal_code || "",
    contact_phone: theatre.contact_phone || "",
    contact_email: theatre.contact_email || "",
    tax_rate_percent: theatre.tax_rate_percent ?? 0,
    status: theatre.is_active ? "active" : "suspended",
    joinedDate:
      theatre.createdAt || theatre.created_at || new Date().toISOString(),
    owner: theatre.owner_name || "-",
  }));

  const filteredVenues = venues.filter((venue: any) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.contact_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || venue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenue.name || !newVenue.address || !newVenue.city) {
      toast({ description: "Name, address, and city are required" });
      return;
    }

    try {
      setIsCreating(true);
      await createTheatre({
        name: newVenue.name,
        address: newVenue.address,
        city: newVenue.city,
        state: newVenue.state,
        country: newVenue.country,
        postal_code: newVenue.postal_code,
        tax_rate_percent: newVenue.tax_rate_percent,
        contact_phone: newVenue.contact_phone,
        contact_email: newVenue.contact_email,
        owner_name: newVenue.owner_name,
      });

      toast({ description: "Venue created successfully" });
      setIsCreateDialogOpen(false);
      setNewVenue({
        name: "",
        address: "",
        city: "",
        state: "",
        country: "India",
        postal_code: "",
        contact_phone: "",
        contact_email: "",
        owner_name: "",
        tax_rate_percent: 18,
      });
      await refreshTheatres();
    } catch (error: any) {
      toast({ description: error?.message || "Failed to create venue" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Venue Management</h2>
          <p className="text-muted-foreground">
            Manage all venues on the platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshTheatres} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="cinema-glow">
                <Plus className="h-4 w-4 mr-2" />
                Add Venue
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Venue</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateVenue} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venueName">Venue Name *</Label>
                    <Input
                      id="venueName"
                      value={newVenue.name}
                      onChange={(e) =>
                        setNewVenue((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="bg-input border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name *</Label>
                    <Input
                      id="ownerName"
                      value={newVenue.owner_name}
                      onChange={(e) =>
                        setNewVenue((prev) => ({
                          ...prev,
                          owner_name: e.target.value,
                        }))
                      }
                      className="bg-input border-border"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={newVenue.contact_email}
                      onChange={(e) =>
                        setNewVenue((prev) => ({
                          ...prev,
                          contact_email: e.target.value,
                        }))
                      }
                      className="bg-input border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={newVenue.contact_phone}
                      onChange={(e) =>
                        setNewVenue((prev) => ({
                          ...prev,
                          contact_phone: e.target.value,
                        }))
                      }
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venueAddress">Address *</Label>
                  <Input
                    id="venueAddress"
                    value={newVenue.address}
                    onChange={(e) =>
                      setNewVenue((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="bg-input border-border"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={newVenue.city}
                      onChange={(e) =>
                        setNewVenue((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      className="bg-input border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={newVenue.state}
                      onChange={(e) =>
                        setNewVenue((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={newVenue.country}
                      onChange={(e) =>
                        setNewVenue((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={newVenue.postal_code}
                    onChange={(e) =>
                      setNewVenue((prev) => ({
                        ...prev,
                        postal_code: e.target.value,
                      }))
                    }
                    className="bg-input border-border"
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Venue"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search venues, addresses, cities, or emails..."
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
          {theatresLoading && (
            <div className="text-sm text-muted-foreground">
              Loading venues...
            </div>
          )}
          {!theatresLoading && (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Venue</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVenues.map((venue: any) => (
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
                        <div className="font-medium text-sm">{venue.city}</div>
                        <div className="text-xs text-muted-foreground">
                          {venue.state && `${venue.state}, `}
                          {venue.country}
                        </div>
                        {venue.postal_code && (
                          <div className="text-xs text-muted-foreground">
                            {venue.postal_code}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {venue.contact_email && (
                          <div className="text-sm text-muted-foreground">
                            {venue.contact_email}
                          </div>
                        )}
                        {venue.contact_phone && (
                          <div className="text-xs text-muted-foreground">
                            {venue.contact_phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{venue.owner}</div>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

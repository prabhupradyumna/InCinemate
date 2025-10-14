"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Settings,
  Building2,
  FileText,
  Clock,
  Check,
  Plus,
  Users,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  listTheatres,
  createAuditoriumConfiguration,
  listAuditoriums,
} from "@/lib/superadmin";
import { useToast } from "@/hooks/use-toast";

export function AuditoriumBuilder() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("approved");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTheatre, setSelectedTheatre] = useState("");
  const [auditoriumName, setAuditoriumName] = useState("");
  const [dialogTheatres, setDialogTheatres] = useState<any[]>([]);
  const [dialogTheatresLoading, setDialogTheatresLoading] = useState(false);

  // Manual data fetching (like user management)
  const [requests, setRequests] = useState<any[]>([]);
  const [theatres, setTheatres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [theatresLoading, setTheatresLoading] = useState(false);
  const [error, setError] = useState("");
  const [auditoriums, setAuditoriums] = useState<any[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch theatres and auditoriums in parallel (drop requests)
        const [theatresData, auditoriumsData] = await Promise.all([
          listTheatres(),
          listAuditoriums(),
        ]);

        if (mounted) {
          setTheatres(theatresData || []);
          setAuditoriums(auditoriumsData || []);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Failed to load data");
          console.error("Failed to fetch data:", err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  const refreshAuditoriums = async () => {
    try {
      const data = await listAuditoriums();
      setAuditoriums(data || []);
    } catch (err: any) {
      console.error("Failed to refresh auditoriums:", err);
    }
  };

  const fetchDialogData = async () => {
    try {
      console.log("🔍 Fetching dialog data...");
      setDialogTheatresLoading(true);

      // Fetch theatres for the dialog
      const theatresData = await listTheatres();

      console.log("📊 Dialog data fetched:", {
        theatres: theatresData?.length || 0,
      });

      setDialogTheatres(theatresData || []);
    } catch (err: any) {
      console.error("❌ Failed to fetch dialog data:", err);
      toast({
        title: "Error",
        description: "Failed to load theatre data",
      });
    } finally {
      setDialogTheatresLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
    fetchDialogData(); // Fetch fresh data when dialog opens
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    // Reset form state
    setSelectedTheatre("");
    setAuditoriumName("");
    setDialogTheatres([]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/40">
            <Check className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "configured":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40">
            <Settings className="h-3 w-3 mr-1" />
            Configured
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/40">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredRequests = requests.filter((request: any) => {
    const matchesSearch =
      request.theatre?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleConfigure = (requestId: string) => {
    router.push(`/super-admin/auditoriums/configure/${requestId}`);
  };

  const handleCreateAuditorium = async () => {
    if (!selectedTheatre || !auditoriumName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select theatre and provide auditorium name",
      });
      return;
    }

    try {
      setIsCreating(true);

      // Create a mock auditorium configuration with basic seat layout
      const basicSeatMap = [
        {
          row: "A",
          number: 1,
          category: "vip",
          x_position: 50,
          y_position: 100,
          is_active: true,
        },
        {
          row: "A",
          number: 2,
          category: "vip",
          x_position: 80,
          y_position: 100,
          is_active: true,
        },
        {
          row: "A",
          number: 3,
          category: "vip",
          x_position: 110,
          y_position: 100,
          is_active: true,
        },
        {
          row: "A",
          number: 4,
          category: "vip",
          x_position: 140,
          y_position: 100,
          is_active: true,
        },
        {
          row: "A",
          number: 5,
          category: "vip",
          x_position: 170,
          y_position: 100,
          is_active: true,
        },
        {
          row: "B",
          number: 1,
          category: "premium",
          x_position: 50,
          y_position: 140,
          is_active: true,
        },
        {
          row: "B",
          number: 2,
          category: "premium",
          x_position: 80,
          y_position: 140,
          is_active: true,
        },
        {
          row: "B",
          number: 3,
          category: "premium",
          x_position: 110,
          y_position: 140,
          is_active: true,
        },
        {
          row: "B",
          number: 4,
          category: "premium",
          x_position: 140,
          y_position: 140,
          is_active: true,
        },
        {
          row: "B",
          number: 5,
          category: "premium",
          x_position: 170,
          y_position: 140,
          is_active: true,
        },
        {
          row: "C",
          number: 1,
          category: "regular",
          x_position: 50,
          y_position: 180,
          is_active: true,
        },
        {
          row: "C",
          number: 2,
          category: "regular",
          x_position: 80,
          y_position: 180,
          is_active: true,
        },
        {
          row: "C",
          number: 3,
          category: "regular",
          x_position: 110,
          y_position: 180,
          is_active: true,
        },
        {
          row: "C",
          number: 4,
          category: "regular",
          x_position: 140,
          y_position: 180,
          is_active: true,
        },
        {
          row: "C",
          number: 5,
          category: "regular",
          x_position: 170,
          y_position: 180,
          is_active: true,
        },
      ];

      const auditoriumData = {
        request_id: `manual-${Date.now()}`, // Mock request ID for manual creation
        theatre_id: selectedTheatre,
        name: auditoriumName,
        seat_map: basicSeatMap,
        total_seats: basicSeatMap.length,
        configuration: {
          rows: 3,
          seat_categories: {
            vip: 5,
            premium: 5,
            regular: 5,
          },
        },
      };

      await createAuditoriumConfiguration(auditoriumData);

      toast({
        title: "Success",
        description: `Auditorium "${auditoriumName}" created successfully with basic seat layout`,
      });

      setIsCreateDialogOpen(false);
      setSelectedTheatre("");
      setAuditoriumName("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create auditorium",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r: any) => r.status === "pending").length,
    approved: requests.filter((r: any) => r.status === "approved").length,
    configured: requests.filter((r: any) => r.status === "configured").length,
    rejected: requests.filter((r: any) => r.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Auditorium Builder
          </h2>
          <p className="text-muted-foreground">
            Create auditoriums manually or configure approved requests
          </p>
        </div>
        <Button
          onClick={handleOpenCreateDialog}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Auditorium
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.approved}
            </div>
            <p className="text-sm text-muted-foreground">Ready to Configure</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.configured}
            </div>
            <p className="text-sm text-muted-foreground">Configured</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected}
            </div>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by theatre name, tenant ID, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-input border-border">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="configured">Configured</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auditoriums Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Auditoriums
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Failed to load auditoriums
            </div>
          ) : auditoriums.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No auditoriums found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Auditorium</TableHead>
                  <TableHead>Theatre</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditoriums.map((aud: any) => (
                  <TableRow key={aud.id}>
                    <TableCell>
                      <div className="font-medium">{aud.name}</div>
                    </TableCell>
                    <TableCell>{aud.Theatre?.name || "-"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {aud.Theatre?.city || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {aud.capacity ?? 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/super-admin/auditoriums/configure/${aud.id}`
                            )
                          }
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
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

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="outline"
              onClick={() =>
                router.push("/super-admin?tab=auditorium-requests")
              }
            >
              <FileText className="h-4 w-4 mr-2" />
              Manage All Requests
            </Button>
            <Button
              variant="outline"
              onClick={() => setStatusFilter("approved")}
            >
              <Check className="h-4 w-4 mr-2" />
              Show Ready to Configure
            </Button>
            <Button variant="outline" onClick={refreshAuditoriums}>
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Auditorium Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) =>
          open ? handleOpenCreateDialog() : handleCloseCreateDialog()
        }
      >
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Auditorium</DialogTitle>
            <DialogDescription>
              Manually create an auditorium for any theatre with a basic seat
              layout
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Theatre Selection */}
            <div className="space-y-2">
              <Label htmlFor="theatre">Select Theatre/Venue</Label>
              <Select
                value={selectedTheatre}
                onValueChange={setSelectedTheatre}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue
                    placeholder={
                      dialogTheatresLoading
                        ? "Loading theatres..."
                        : "Choose a theatre..."
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {dialogTheatresLoading ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        Loading theatres...
                      </div>
                    </SelectItem>
                  ) : dialogTheatres.length > 0 ? (
                    dialogTheatres.map((theatre: any) => (
                      <SelectItem key={theatre.id} value={theatre.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {theatre.name} - {theatre.city}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-theatres" disabled>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        No theatres found
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Auditorium Name */}
            <div className="space-y-2">
              <Label htmlFor="auditoriumName">Auditorium Name</Label>
              <Input
                id="auditoriumName"
                value={auditoriumName}
                onChange={(e) => setAuditoriumName(e.target.value)}
                placeholder="e.g., Screen 1, Main Hall, VIP Auditorium"
                className="bg-input border-border"
              />
            </div>

            {/* Preview Info */}
            <div className="p-4 bg-secondary/30 rounded-lg border border-border">
              <h4 className="font-medium mb-2">Basic Seat Layout Preview</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mx-auto mb-1"></div>
                  <p>VIP Row A (5 seats)</p>
                </div>
                <div className="text-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mx-auto mb-1"></div>
                  <p>Premium Row B (5 seats)</p>
                </div>
                <div className="text-center">
                  <div className="w-4 h-4 bg-gray-500 rounded mx-auto mb-1"></div>
                  <p>Regular Row C (5 seats)</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Total: 15 seats. You can customize the layout after creation
                using the Visual Builder.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCloseCreateDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateAuditorium}
              disabled={
                isCreating || !selectedTheatre || !auditoriumName.trim()
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? "Creating..." : "Create Auditorium"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

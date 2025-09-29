"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Filter, Eye, Check, X, Clock, Building2, FileText, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { listAuditoriumRequests, updateAuditoriumRequestStatus } from "@/lib/superadmin"
import { useToast } from "@/hooks/use-toast"

export function AuditoriumRequests() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const { toast } = useToast()

  // Manual data fetching (like user management)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch data on component mount
  useEffect(() => {
    let mounted = true
    
    const fetchRequests = async () => {
      try {
        setLoading(true)
        setError("")
        
        const requestsData = await listAuditoriumRequests()
        
        if (mounted) {
          setRequests(requestsData || [])
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Failed to load auditorium requests")
          console.error("Failed to fetch requests:", err)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchRequests()
    
    return () => {
      mounted = false
    }
  }, [])

  const refreshRequests = async () => {
    try {
      const requestsData = await listAuditoriumRequests()
      setRequests(requestsData || [])
    } catch (err: any) {
      console.error("Failed to refresh requests:", err)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "approved":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/40"><Check className="h-3 w-3 mr-1" />Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/40"><X className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredRequests = requests.filter((request: any) => {
    const matchesSearch = 
      request.theatre?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.tenant_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request)
    setIsDetailOpen(true)
  }

  const handleApprove = async (requestId: string) => {
    try {
      setIsProcessing(true)
      await updateAuditoriumRequestStatus(requestId, 'approved')
      toast({ description: "Auditorium request approved successfully" })
      await refreshRequests()
      setIsDetailOpen(false)
    } catch (error: any) {
      toast({ description: error?.message || "Failed to approve request" })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      toast({ description: "Please provide a reason for rejection" })
      return
    }

    try {
      setIsProcessing(true)
      await updateAuditoriumRequestStatus(requestId, 'rejected', rejectionReason)
      toast({ description: "Auditorium request rejected" })
      await refreshRequests()
      setIsDetailOpen(false)
      setRejectionReason("")
    } catch (error: any) {
      toast({ description: error?.message || "Failed to reject request" })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfigure = (requestId: string) => {
    router.push(`/super-admin/auditoriums/configure/${requestId}`)
  }

  const stats = {
    total: requests.length,
    pending: requests.filter((r: any) => r.status === 'pending').length,
    approved: requests.filter((r: any) => r.status === 'approved').length,
    rejected: requests.filter((r: any) => r.status === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Auditorium Requests</h2>
          <p className="text-muted-foreground">Review and manage auditorium setup requests from venues</p>
        </div>
        <Button onClick={refreshRequests} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by theatre name, tenant ID, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-input border-border">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Auditorium Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-sm text-muted-foreground">Loading requests...</div>
          )}
          {error && !loading && (
            <div className="text-sm text-red-400">{error}</div>
          )}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Theatre</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request: any) => (
                  <TableRow key={request.id} className="border-border">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {request.theatre?.name || 'Unknown Theatre'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {request.theatre?.address || 'No address'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{request.tenant_id}</div>
                        <div className="text-xs text-muted-foreground">Tenant ID</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(request.created_at)}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm text-muted-foreground">
                        {request.notes || 'No notes provided'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-green-400 hover:text-green-400"
                              onClick={() => handleApprove(request.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-400 hover:text-red-400"
                              onClick={() => handleViewDetails(request)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {request.status === 'approved' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-blue-400 hover:text-blue-400"
                            onClick={() => handleConfigure(request.id)}
                            title="Configure Auditorium"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Request Details Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Auditorium Request Details</DialogTitle>
            <DialogDescription>
              Review the auditorium setup request and take appropriate action
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Theatre Name</label>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    {selectedRequest.theatre?.name || 'Unknown Theatre'}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tenant ID</label>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    {selectedRequest.tenant_id}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Theatre Address</label>
                <div className="p-3 rounded-lg bg-secondary/50">
                  {selectedRequest.theatre?.address || 'No address provided'}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Blueprint URL</label>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <a 
                    href={selectedRequest.blueprint_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {selectedRequest.blueprint_url}
                  </a>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <div className="p-3 rounded-lg bg-secondary/50 min-h-[100px]">
                  {selectedRequest.notes || 'No notes provided'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Request Date</label>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    {formatDate(selectedRequest.created_at)}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Status</label>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>
              </div>

              {/* Rejection Reason */}
              {selectedRequest.status === 'pending' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason for rejection..."
                    className="bg-input border-border"
                  />
                </div>
              )}

              {/* Actions */}
              {selectedRequest.status === 'pending' && (
                <DialogFooter className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDetailOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleReject(selectedRequest.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Rejecting..." : "Reject Request"}
                  </Button>
                  <Button 
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? "Approving..." : "Approve Request"}
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

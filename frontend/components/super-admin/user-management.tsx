"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Download, Eye, Ban, UserCheck, Plus, Shield } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { listAdmins, createAdmin, listPermissions, getAdminPermissions, updateAdminPermissions, listTenants, createTenant, type AdminUserDTO, type PermissionDTO } from "@/lib/superadmin"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

// Backend-driven admin list (initially empty)
const initialUsers: AdminUserDTO[] = []

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [users, setUsers] = useState<AdminUserDTO[]>(initialUsers)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const { toast } = useToast()

  // Create Admin modal state
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formEmail, setFormEmail] = useState("")
  const [formName, setFormName] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formTenantId, setFormTenantId] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [tenants, setTenants] = useState<Array<{ tenant_id: string; name: string }>>([])
  const [tenantLoading, setTenantLoading] = useState(false)

  // Permissions modal state
  const [permOpen, setPermOpen] = useState(false)
  const [permLoading, setPermLoading] = useState(false)
  const [permSaving, setPermSaving] = useState(false)
  const [currentAdminId, setCurrentAdminId] = useState<string>("")
  const [allPerms, setAllPerms] = useState<PermissionDTO[]>([])
  const [selectedPermIds, setSelectedPermIds] = useState<number[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const data = await listAdmins()
        if (mounted) setUsers(Array.isArray(data) ? data : [])
        // Preload tenants for admin modal
        setTenantLoading(true)
        const ts = await listTenants()
        if (mounted) setTenants((ts || []).map((t: any) => ({ tenant_id: t.tenant_id, name: t.name })))
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load users")
      } finally {
        if (mounted) {
          setLoading(false)
          setTenantLoading(false)
        }
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault()
    if (!formEmail || !formName || !formTenantId) {
      toast({ description: "Email, Full name and Tenant ID are required" })
      return
    }
    try {
      setCreating(true)
      await createAdmin({ email: formEmail, full_name: formName, phone: formPhone || undefined, tenant_id: formTenantId, password: formPassword || undefined })
      toast({ description: "Admin created successfully" })
      // refresh list
      const data = await listAdmins()
      setUsers(Array.isArray(data) ? data : [])
      setOpen(false)
      setFormEmail("")
      setFormName("")
      setFormPhone("")
      setFormTenantId("")
      setFormPassword("")
    } catch (e: any) {
      toast({ description: e?.response?.data?.error || e?.message || "Failed to create admin" })
    } finally {
      setCreating(false)
    }
  }

  // Tenant creation modal state
  const [tenantOpen, setTenantOpen] = useState(false)
  const [tenantSaving, setTenantSaving] = useState(false)
  const [tTenantId, setTTenantId] = useState("")
  const [tName, setTName] = useState("")
  const [tOwner, setTOwner] = useState("")
  const [tEmail, setTEmail] = useState("")
  const [tPhone, setTPhone] = useState("")
  const [tAddress, setTAddress] = useState("")
  const [tCity, setTCity] = useState("")
  const [tState, setTState] = useState("")
  const [tCountry, setTCountry] = useState("")
  const [tPostal, setTPostal] = useState("")

  async function handleCreateTenant(e: React.FormEvent) {
    e.preventDefault()
    if (!tTenantId || !tName) {
      toast({ description: "Tenant ID and Name are required" })
      return
    }
    try {
      setTenantSaving(true)
      const res = await createTenant({ tenant_id: tTenantId, name: tName, owner_name: tOwner || undefined, email: tEmail || undefined, phone: tPhone || undefined, address: tAddress || undefined, city: tCity || undefined, state: tState || undefined, country: tCountry || undefined, postal_code: tPostal || undefined })
      toast({ description: "Tenant created" })
      // refresh tenants and select newly created
      const ts = await listTenants()
      const mapped = (ts || []).map((t: any) => ({ tenant_id: t.tenant_id, name: t.name }))
      setTenants(mapped)
      setFormTenantId(res?.tenant_id || tTenantId)
      setTenantOpen(false)
      setTTenantId("")
      setTName("")
      setTOwner("")
      setTPhone("")
      setTEmail("")
      setTAddress("")
      setTCity("")
      setTState("")
      setTCountry("")
      setTPostal("")
    } catch (e: any) {
      toast({ description: e?.response?.data?.error || e?.message || "Failed to create tenant" })
    } finally {
      setTenantSaving(false)
    }
  }

  async function openPermissions(adminId: string) {
    try {
      setPermOpen(true)
      setPermLoading(true)
      setCurrentAdminId(adminId)
      // fetch all permissions and admin's current permissions
      const [all, assigned] = await Promise.all([
        listPermissions(),
        getAdminPermissions(adminId)
      ])
      setAllPerms(all || [])
      const granted = (assigned?.permissions || []).filter((p: any) => p.granted).map((p: any) => p.id)
      setSelectedPermIds(granted)
    } catch (e: any) {
      toast({ description: e?.message || "Failed to load permissions" })
    } finally {
      setPermLoading(false)
    }
  }

  function togglePerm(id: number) {
    setSelectedPermIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  async function savePermissions() {
    try {
      setPermSaving(true)
      await updateAdminPermissions(currentAdminId, selectedPermIds)
      toast({ description: "Permissions updated" })
      setPermOpen(false)
    } catch (e: any) {
      toast({ description: e?.response?.data?.error || e?.message || "Failed to update permissions" })
    } finally {
      setPermSaving(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/40">Super Admin</Badge>
      case "admin":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40">Admin</Badge>
      case "customer":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/40">Customer</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

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

  const normalized = users.map((u: any) => ({
    id: String(u.id),
    name: u.full_name || u.email,
    email: u.email,
    role: "admin",
    status: u.is_active ? "active" : "suspended",
    joinedDate: u.createdAt || u.created_at || "",
    lastActive: "",
    totalBookings: 0,
    totalSpent: 0,
    tenantId: u.Tenant?.tenant_id || u.tenant_id || "",
    tenantName: u.Tenant?.name || "",
  }))

  const filteredUsers = normalized.filter((user) => {
    const matchesSearch =
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const totalUsers = normalized.length
  const activeUsers = normalized.filter((u) => u.status === "active").length
  const adminUsers = normalized.filter((u) => u.role === "admin").length
  const customerUsers = 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage all platform users and administrators</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="cinema-glow">
                <Plus className="h-4 w-4 mr-2" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Create Admin</DialogTitle>
                <DialogDescription>Onboard a new admin by providing their details</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="full_name" className="text-sm">Full Name</label>
                  <Input id="full_name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Sarah Johnson" className="bg-input border-border" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm">Email</label>
                  <Input id="email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="admin@example.com" className="bg-input border-border" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm">Phone</label>
                  <Input id="phone" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="Optional" className="bg-input border-border" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Tenant</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select value={formTenantId} onValueChange={setFormTenantId}>
                        <SelectTrigger className="w-full bg-input border-border">
                          <SelectValue placeholder={tenantLoading ? "Loading tenants..." : "Select tenant"} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border max-h-64">
                          {tenants.map((t) => (
                            <SelectItem key={t.tenant_id} value={t.tenant_id}>{t.name} ({t.tenant_id})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="button" variant="outline" onClick={() => setTenantOpen(true)}>New Tenant</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm">Password (optional)</label>
                  <Input id="password" type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="Min 6 characters" className="bg-input border-border" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Admin"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{totalUsers}</div>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">{activeUsers}</div>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-400">{adminUsers}</div>
            <p className="text-sm text-muted-foreground">Administrators</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{customerUsers}</div>
            <p className="text-sm text-muted-foreground">Customers</p>
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
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-input border-border">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
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

      {/* Users Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-sm text-muted-foreground">Loading users...</div>
          )}
          {error && !loading && (
            <div className="text-sm text-red-400">{error}</div>
          )}
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>User</TableHead>
                <TableHead>Tenant ID</TableHead>
                <TableHead>Tenant Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-border">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.tenantId || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.tenantName || '-'}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getRoleBadge(user.role)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role === "customer" ? (
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{user.totalBookings} bookings</div>
                        <div className="text-xs text-muted-foreground">${user.totalSpent.toFixed(2)} spent</div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Last active: {formatDate(user.lastActive)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.joinedDate)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openPermissions(user.id)} title="Edit permissions">
                        <Shield className="h-4 w-4" />
                      </Button>
                      {user.status === "active" ? (
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Ban className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-400">
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Permissions Editor Modal */}
      <Dialog open={permOpen} onOpenChange={setPermOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Admin Permissions</DialogTitle>
            <DialogDescription>Grant or revoke capabilities for this admin</DialogDescription>
          </DialogHeader>
          {permLoading ? (
            <div className="text-sm text-muted-foreground">Loading permissions...</div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-auto pr-2">
              {groupByCategory(allPerms).map(({ category, items }) => (
                <div key={category} className="space-y-2">
                  <div className="text-sm font-medium capitalize">{category.replace(/_/g, ' ')}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {items.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={selectedPermIds.includes(p.id)}
                          onChange={() => togglePerm(p.id)}
                        />
                        <span className="text-foreground">{p.name}</span>
                        <span className="text-muted-foreground text-xs">{p.description}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermOpen(false)}>Cancel</Button>
            <Button onClick={savePermissions} disabled={permSaving}>{permSaving ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Tenant Modal */}
      <Dialog open={tenantOpen} onOpenChange={setTenantOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Tenant</DialogTitle>
            <DialogDescription>Onboard a new tenant. Only ID and Name are required for now.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTenant} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="t_id" className="text-sm">Tenant ID</label>
              <Input id="t_id" value={tTenantId} onChange={(e) => setTTenantId(e.target.value)} placeholder="Enter tenant id" className="bg-input border-border" required />
            </div>
            <div className="space-y-1">
              <label htmlFor="t_name" className="text-sm">Name</label>
              <Input id="t_name" value={tName} onChange={(e) => setTName(e.target.value)} placeholder="Enter tenant name" className="bg-input border-border" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-sm">Owner</label>
                <Input value={tOwner} onChange={(e) => setTOwner(e.target.value)} placeholder="Enter owner name" className="bg-input border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-sm">Phone</label>
                <Input value={tPhone} onChange={(e) => setTPhone(e.target.value)} placeholder="Enter phone" className="bg-input border-border" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm">Email</label>
              <Input value={tEmail} onChange={(e) => setTEmail(e.target.value)} placeholder="Enter email" className="bg-input border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-sm">Address</label>
              <Input value={tAddress} onChange={(e) => setTAddress(e.target.value)} placeholder="Enter address" className="bg-input border-border" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input value={tCity} onChange={(e) => setTCity(e.target.value)} placeholder="Enter city" className="bg-input border-border" />
              <Input value={tState} onChange={(e) => setTState(e.target.value)} placeholder="Enter state" className="bg-input border-border" />
              <Input value={tCountry} onChange={(e) => setTCountry(e.target.value)} placeholder="Enter country" className="bg-input border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-sm">Postal Code</label>
              <Input value={tPostal} onChange={(e) => setTPostal(e.target.value)} placeholder="Enter postal code" className="bg-input border-border" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTenantOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={tenantSaving}>{tenantSaving ? 'Creating...' : 'Create Tenant'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper to group permissions by category
function groupByCategory(perms: PermissionDTO[]): { category: string; items: PermissionDTO[] }[] {
  const map = new Map<string, PermissionDTO[]>()
  perms.forEach((p) => {
    const key = p.category || 'general'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  })
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }))
}

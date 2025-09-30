"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { MovieTable } from "@/components/super-admin/movie-table"
import { ProtectedRoute } from "@/components/auth/protected-route"
import AdminShell from "@/components/layout/AdminShell"
import Link from "next/link"

export default function MoviesPage() {
  const [showActive, setShowActive] = useState(true);

  const statusFilter = showActive ? 'active' : 'inactive';

  return (
    <ProtectedRoute allowedRoles={["super-admin"]}>
      <AdminShell>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Movie Management</h1>
              <p className="text-muted-foreground">Manage all movies available on the platform</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Refresh</Button>
              <Link href="/super-admin/movies/add">
                <Button variant="default" className="bg-blue-600 text-white">+ Add Movie</Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {showActive ? 'Active Movies' : 'Inactive Movies'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {showActive ? 'Active' : 'Inactive'}
                </span>
                <Switch
                  checked={showActive}
                  onCheckedChange={setShowActive}
                />
              </div>
            </div>
          </div>
          <MovieTable statusFilter={statusFilter} />
        </div>
      </AdminShell>
    </ProtectedRoute>
  )
}
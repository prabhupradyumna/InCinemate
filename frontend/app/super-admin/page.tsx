import { SuperAdminDashboard } from "@/components/super-admin/super-admin-dashboard"
import { SuperAdminHeader } from "@/components/super-admin/super-admin-header"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function SuperAdminPage() {
  return (
    <ProtectedRoute allowedRoles={["super-admin"]}>
      <div className="min-h-screen bg-background">
        <SuperAdminHeader />
        <main className="container mx-auto px-4 py-8">
          <SuperAdminDashboard />
        </main>
      </div>
    </ProtectedRoute>
  )
}

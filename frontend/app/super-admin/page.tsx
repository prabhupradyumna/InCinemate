import { SuperAdminDashboard } from "@/components/super-admin/super-admin-dashboard";
import { ProtectedRoute } from "@/components/auth/protected-route";
import AdminShell from "@/components/layout/AdminShell";

export default function SuperAdminPage() {
  return (
    <ProtectedRoute allowedRoles={["super-admin"]}>
      <AdminShell>
        <SuperAdminDashboard />
      </AdminShell>
    </ProtectedRoute>
  );
}

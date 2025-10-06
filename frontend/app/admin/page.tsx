import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { ProtectedRoute } from "@/components/customer/protected-route";
import AdminShell from "@/components/layout/AdminShell";

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminShell>
        <AdminDashboard />
      </AdminShell>
    </ProtectedRoute>
  );
}

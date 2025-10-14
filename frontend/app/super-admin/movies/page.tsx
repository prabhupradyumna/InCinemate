import MovieListTable from "../../../components/super-admin/movie-list-table";
import { ProtectedRoute } from "@/components/customer/protected-route";
import AdminShell from "@/components/layout/AdminShell";

export default function MoviesPage() {
  return (
    <ProtectedRoute allowedRoles={["super-admin"]}>
      <AdminShell>
        <div className="px-8 py-6">
          <MovieListTable />
        </div>
      </AdminShell>
    </ProtectedRoute>
  );
}
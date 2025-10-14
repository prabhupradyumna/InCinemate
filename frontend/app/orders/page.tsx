"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MobileLayout } from "@/components/customer/mobile-layout";
import { useAuth } from "@/components/customer/auth-provider";
import { LogOut } from "lucide-react";
// import { getMyBookings } from "@/lib/customer";

export default function OrdersPage() {
  const [loading] = useState(true);
  const [orders] = useState<any[]>([]);
  const { user, logout } = useAuth();

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const res: any = await getMyBookings({ page: 1, limit: 20 });
  //       setOrders(res?.data || res?.items || []);
  //     } finally {
  //       setLoading(false);
  //     }
  //   })();
  // }, []);

  // Check if user is admin or super-admin
  const isAdminUser = user && (user.role === "admin" || user.role === "super-admin");

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <MobileLayout>
      <div className="space-y-4">
        {isAdminUser ? (
          // Profile section for admin/super-admin users
          <>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
              <p className="text-muted-foreground">Account management</p>
            </div>

            <Card className="max-w-xl mx-auto">
              <CardContent className="pt-6">
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          // Bookings section for regular users (if they had bookings)
          <>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">My Bookings</h1>
              <p className="text-muted-foreground">View your movie bookings</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No bookings yet.</p>
                    <p className="text-sm text-muted-foreground">
                      Book your first movie ticket to see it here!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((o: any) => (
                      <div
                        key={o.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">
                              {o.Show?.Movie?.title || o.movie?.title || "Movie"}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {new Date(
                                o.Show?.show_datetime || o.show_datetime
                              ).toLocaleString()}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                o.status === 'confirmed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : o.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {o.status}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {o.seats?.length || 0} seats
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-foreground">
                              AED {o.total_price}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MobileLayout>
  );
}

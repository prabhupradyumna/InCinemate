"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyBookings } from "@/lib/customer";

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res: any = await getMyBookings({ page: 1, limit: 20 });
        setOrders(res?.data || res?.items || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o: any) => (
                <div
                  key={o.id}
                  className="border rounded-md p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {o.Show?.Movie?.title || o.movie?.title || "Movie"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(
                        o.Show?.show_datetime || o.show_datetime
                      ).toLocaleString()}
                    </p>
                    <p className="text-xs">Status: {o.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Total: ₹{o.total_price}</p>
                    <p className="text-xs text-muted-foreground">
                      Seats: {o.seats?.length || "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

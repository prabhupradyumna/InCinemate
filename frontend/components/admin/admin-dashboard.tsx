"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingsOverview } from "@/components/admin/bookings-overview"
import { BookedSeatsManagement } from "@/components/admin/booked-seats-management"

export function AdminDashboard() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("bookings")

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['bookings', 'booked-seats'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, Cinema Manager</h1>
        <p className="text-muted-foreground">Manage your venue, shows, and bookings from your dashboard</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-secondary">
          <TabsTrigger
            value="bookings"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Bookings
          </TabsTrigger>
          <TabsTrigger
            value="booked-seats"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Booked Seats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <BookingsOverview />
        </TabsContent>
        <TabsContent value="booked-seats">
          <BookedSeatsManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShowsManagement } from "@/components/admin/shows-management"
import { VenueSettings } from "@/components/admin/venue-settings"
import { BookingsOverview } from "@/components/admin/bookings-overview"
import { Calendar, DollarSign, Users, Film, TrendingUp, Clock } from "lucide-react"

// Mock data
const dashboardStats = {
  totalRevenue: 15420.5,
  totalBookings: 342,
  activeShows: 12,
  occupancyRate: 78.5,
  recentBookings: [
    { id: "1", movie: "The Dark Knight Returns", customer: "John Doe", seats: 2, amount: 24.0, time: "2 hours ago" },
    { id: "2", movie: "Cosmic Journey", customer: "Jane Smith", seats: 4, amount: 56.0, time: "3 hours ago" },
    { id: "3", movie: "Love in Paris", customer: "Mike Johnson", seats: 1, amount: 10.0, time: "5 hours ago" },
  ],
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, Cinema Manager</h1>
        <p className="text-muted-foreground">Manage your venue, shows, and bookings from your dashboard</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-secondary">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="shows"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Shows
          </TabsTrigger>
          <TabsTrigger
            value="bookings"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Bookings
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">${dashboardStats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{dashboardStats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +8.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Shows</CardTitle>
                <Film className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{dashboardStats.activeShows}</div>
                <p className="text-xs text-muted-foreground">Across all screens</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{dashboardStats.occupancyRate}%</div>
                <p className="text-xs text-muted-foreground">Average this week</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardStats.recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{booking.movie}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.customer} • {booking.seats} seats
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-medium text-sm text-primary">${booking.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {booking.time}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full bg-transparent">
                  View All Bookings
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" onClick={() => setActiveTab("shows")}>
                  <Film className="h-4 w-4 mr-2" />
                  Create New Show
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setActiveTab("bookings")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Bookings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setActiveTab("settings")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Update Venue Settings
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <DollarSign className="h-4 w-4 mr-2" />
                  View Revenue Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shows">
          <ShowsManagement />
        </TabsContent>

        <TabsContent value="bookings">
          <BookingsOverview />
        </TabsContent>

        <TabsContent value="settings">
          <VenueSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

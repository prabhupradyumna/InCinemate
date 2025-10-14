"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VenueManagement } from "@/components/super-admin/venue-management";
import { PlatformAnalytics } from "@/components/super-admin/platform-analytics";
import { UserManagement } from "@/components/super-admin/user-management";
import { PlatformSettings } from "@/components/super-admin/platform-settings";
import { AuditoriumRequests } from "@/components/super-admin/auditorium-requests";
import { AuditoriumBuilder } from "@/components/super-admin/auditorium-builder";
import { ShowsManagement } from "@/components/super-admin/shows-management";
import { BookingsManagement } from "@/components/super-admin/bookings-management";
import {
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  Activity,
  Globe,
} from "lucide-react";
import {
  listTenants,
  listAdmins,
  listAuditoriumRequests,
} from "@/lib/superadmin";
import { useApiCall } from "@/lib/hooks";

// Mock platform-wide data
const platformStats = {
  totalVenues: 24,
  totalScreens: 156,
  totalRevenue: 45200.75,
  totalUsers: 12450,
  activeBookings: 1834,
  monthlyGrowth: 15.3,
  topPerformingVenues: [
    { name: "Downtown Cinema", revenue: 8420.5, bookings: 342 },
    { name: "Westside Theater", revenue: 7230.25, bookings: 298 },
    { name: "Central Plaza Movies", revenue: 6890.0, bookings: 276 },
  ],
  recentActivity: [
    {
      type: "venue_added",
      message: "New venue 'Sunset Cinema' added",
      time: "2 hours ago",
    },
    {
      type: "high_revenue",
      message: "Downtown Cinema exceeded AED 1000 daily revenue",
      time: "4 hours ago",
    },
    {
      type: "user_milestone",
      message: "Platform reached 12,000 registered users",
      time: "1 day ago",
    },
  ],
};

export function SuperAdminDashboard() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "overview"
  );

  // Fetch real platform data
  const { data: tenants, loading: tenantsLoading } = useApiCall(
    listTenants,
    []
  );
  const { data: admins, loading: adminsLoading } = useApiCall(listAdmins, []);
  const { data: auditoriumRequests, loading: requestsLoading } = useApiCall(
    listAuditoriumRequests,
    []
  );

  // Update active tab when URL changes
  useEffect(() => {
    const tab = searchParams.get("tab") || "overview";
    setActiveTab(tab);
  }, [searchParams]);

  // Calculate real platform stats
  const platformStats = {
    totalVenues: tenants?.length || 0,
    totalScreens:
      auditoriumRequests?.filter((req: any) => req.status === "approved")
        .length || 0,
    totalRevenue: 45200.75, // TODO: Calculate from real booking data
    totalUsers: (admins?.length || 0) + 12450, // TODO: Add customer count
    activeBookings: 1834, // TODO: Calculate from real booking data
    monthlyGrowth: 15.3, // TODO: Calculate from real data
    topPerformingVenues:
      tenants?.slice(0, 3).map((tenant: any) => ({
        name: tenant.name,
        revenue: Math.random() * 10000, // TODO: Calculate from real data
        bookings: Math.floor(Math.random() * 500), // TODO: Calculate from real data
      })) || [],
    recentActivity: [
      {
        type: "venue_added",
        message: "New venue 'Sunset Cinema' added",
        time: "2 hours ago",
      },
      {
        type: "high_revenue",
        message: "Downtown Cinema exceeded AED 1000 daily revenue",
        time: "4 hours ago",
      },
      {
        type: "user_milestone",
        message: "Platform reached 12,000 registered users",
        time: "1 day ago",
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Platform Overview
        </h1>
        <p className="text-muted-foreground">
          Manage venues, users, and platform-wide settings
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-9 bg-secondary">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Users
          </TabsTrigger>
          <TabsTrigger
            value="venues"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Venues
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
            value="auditorium-requests"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Requests
          </TabsTrigger>
          <TabsTrigger
            value="auditorium-builder"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Builder
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Venues
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {platformStats.totalVenues}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active locations
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Screens
                </CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {platformStats.totalScreens}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all venues
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Platform Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  AED {platformStats.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />+
                  {platformStats.monthlyGrowth}% this month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {platformStats.totalUsers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Registered customers
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Bookings
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {platformStats.activeBookings.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Growth Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {platformStats.monthlyGrowth}%
                </div>
                <p className="text-xs text-muted-foreground">Monthly growth</p>
              </CardContent>
            </Card>
          </div>

          {/* Platform Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Top Performing Venues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {platformStats.topPerformingVenues.map(
                  (venue: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{venue.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {venue.bookings} bookings this month
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm text-primary">
                          AED {venue.revenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                  )
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Recent Platform Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {platformStats.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="venues">
          <VenueManagement />
        </TabsContent>

        <TabsContent value="shows">
          <ShowsManagement />
        </TabsContent>

        <TabsContent value="bookings">
          <BookingsManagement />
        </TabsContent>

        <TabsContent value="auditorium-requests">
          <AuditoriumRequests />
        </TabsContent>

        <TabsContent value="auditorium-builder">
          <AuditoriumBuilder />
        </TabsContent>

        <TabsContent value="analytics">
          <PlatformAnalytics />
        </TabsContent>

        <TabsContent value="settings">
          <PlatformSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

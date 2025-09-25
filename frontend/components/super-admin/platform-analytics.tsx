"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Users, Building2, Calendar } from "lucide-react"

// Mock analytics data
const analyticsData = {
  revenueGrowth: {
    current: 45200.75,
    previous: 38950.25,
    percentage: 16.1,
  },
  userGrowth: {
    current: 12450,
    previous: 11200,
    percentage: 11.2,
  },
  venueGrowth: {
    current: 24,
    previous: 22,
    percentage: 9.1,
  },
  topMovies: [
    { title: "The Dark Knight Returns", bookings: 1234, revenue: 18500.0 },
    { title: "Cosmic Journey", bookings: 987, revenue: 15200.0 },
    { title: "Love in Paris", bookings: 756, revenue: 11800.0 },
  ],
  topVenues: [
    { name: "Downtown Cinema", revenue: 8420.5, growth: 15.3 },
    { name: "Westside Theater", revenue: 7230.25, growth: 12.8 },
    { name: "Central Plaza Movies", revenue: 6890.0, growth: -2.1 },
  ],
  monthlyData: [
    { month: "Jan", revenue: 32000, bookings: 890 },
    { month: "Feb", revenue: 35000, bookings: 1020 },
    { month: "Mar", revenue: 38000, bookings: 1150 },
    { month: "Apr", revenue: 41000, bookings: 1280 },
    { month: "May", revenue: 43000, bookings: 1350 },
    { month: "Jun", revenue: 45200, bookings: 1450 },
  ],
}

export function PlatformAnalytics() {
  const getGrowthIcon = (percentage: number) => {
    return percentage >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-400" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-400" />
    )
  }

  const getGrowthColor = (percentage: number) => {
    return percentage >= 0 ? "text-green-400" : "text-red-400"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Platform Analytics</h2>
        <p className="text-muted-foreground">Comprehensive insights into platform performance</p>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${analyticsData.revenueGrowth.current.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm">
              {getGrowthIcon(analyticsData.revenueGrowth.percentage)}
              <span className={getGrowthColor(analyticsData.revenueGrowth.percentage)}>
                {analyticsData.revenueGrowth.percentage > 0 ? "+" : ""}
                {analyticsData.revenueGrowth.percentage}%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Growth</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{analyticsData.userGrowth.current.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-sm">
              {getGrowthIcon(analyticsData.userGrowth.percentage)}
              <span className={getGrowthColor(analyticsData.userGrowth.percentage)}>
                {analyticsData.userGrowth.percentage > 0 ? "+" : ""}
                {analyticsData.userGrowth.percentage}%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Venue Growth</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{analyticsData.venueGrowth.current}</div>
            <div className="flex items-center gap-1 text-sm">
              {getGrowthIcon(analyticsData.venueGrowth.percentage)}
              <span className={getGrowthColor(analyticsData.venueGrowth.percentage)}>
                {analyticsData.venueGrowth.percentage > 0 ? "+" : ""}
                {analyticsData.venueGrowth.percentage}%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Top Performing Movies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyticsData.topMovies.map((movie, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{movie.title}</p>
                  <p className="text-xs text-muted-foreground">{movie.bookings} bookings</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm text-primary">${movie.revenue.toLocaleString()}</p>
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Top Performing Venues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyticsData.topVenues.map((venue, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{venue.name}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {getGrowthIcon(venue.growth)}
                    <span className={getGrowthColor(venue.growth)}>
                      {venue.growth > 0 ? "+" : ""}
                      {venue.growth}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm text-primary">${venue.revenue.toLocaleString()}</p>
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.monthlyData.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                <div className="font-medium">{data.month} 2024</div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-sm font-medium text-primary">${data.revenue.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-primary">{data.bookings}</div>
                    <div className="text-xs text-muted-foreground">Bookings</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

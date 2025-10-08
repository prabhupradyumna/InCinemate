"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Calendar, Clock, DollarSign } from "lucide-react";
import { formatDate } from "@/lib/utils";

// Mock data
const shows = [
  {
    id: "1",
    movie: "The Dark Knight Returns",
    screen: "Screen 1",
    date: "2024-12-15",
    time: "19:00",
    duration: 165,
    pricing: { premium: 18.0, regular: 12.0 },
    bookedSeats: 45,
    totalSeats: 120,
    status: "active",
  },
  {
    id: "2",
    movie: "Cosmic Journey",
    screen: "Screen 2",
    date: "2024-12-20",
    time: "20:00",
    duration: 142,
    pricing: { premium: 20.0, regular: 14.0 },
    bookedSeats: 32,
    totalSeats: 80,
    status: "active",
  },
  {
    id: "3",
    movie: "Love in Paris",
    screen: "Screen 1",
    date: "2024-12-25",
    time: "18:30",
    duration: 118,
    pricing: { premium: 15.0, regular: 10.0 },
    bookedSeats: 8,
    totalSeats: 120,
    status: "scheduled",
  },
];

const movies = [
  { id: "1", title: "The Dark Knight Returns", duration: 165 },
  { id: "2", title: "Cosmic Journey", duration: 142 },
  { id: "3", title: "Love in Paris", duration: 118 },
  { id: "4", title: "Action Hero", duration: 135 },
];

const screens = [
  { id: "1", name: "Screen 1", capacity: 120 },
  { id: "2", name: "Screen 2", capacity: 80 },
];

export function ShowsManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newShow, setNewShow] = useState({
    movieId: "",
    screenId: "",
    date: "",
    time: "",
    premiumPrice: "",
    regularPrice: "",
  });

  const handleCreateShow = () => {
    // In real app, this would make an API call
    console.log("Creating show:", newShow);
    setIsCreateDialogOpen(false);
    setNewShow({
      movieId: "",
      screenId: "",
      date: "",
      time: "",
      premiumPrice: "",
      regularPrice: "",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/40">
            Active
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40">
            Scheduled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 80) return "text-red-400";
    if (percentage >= 60) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Shows Management</h2>
          <p className="text-muted-foreground">
            Create and manage movie shows for your venue
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="cinema-glow">
              <Plus className="h-4 w-4 mr-2" />
              Create Show
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Create New Show</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="movie">Movie</Label>
                <Select
                  value={newShow.movieId}
                  onValueChange={(value) =>
                    setNewShow((prev) => ({ ...prev, movieId: value }))
                  }
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select a movie" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {movies.map((movie) => (
                      <SelectItem key={movie.id} value={movie.id}>
                        {movie.title} ({movie.duration}m)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="screen">Screen</Label>
                <Select
                  value={newShow.screenId}
                  onValueChange={(value) =>
                    setNewShow((prev) => ({ ...prev, screenId: value }))
                  }
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select a screen" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {screens.map((screen) => (
                      <SelectItem key={screen.id} value={screen.id}>
                        {screen.name} ({screen.capacity} seats)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newShow.date}
                    onChange={(e) =>
                      setNewShow((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newShow.time}
                    onChange={(e) =>
                      setNewShow((prev) => ({ ...prev, time: e.target.value }))
                    }
                    className="bg-input border-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="premiumPrice">Premium Price (₹)</Label>
                  <Input
                    id="premiumPrice"
                    type="number"
                    step="0.01"
                    value={newShow.premiumPrice}
                    onChange={(e) =>
                      setNewShow((prev) => ({
                        ...prev,
                        premiumPrice: e.target.value,
                      }))
                    }
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regularPrice">Regular Price (₹)</Label>
                  <Input
                    id="regularPrice"
                    type="number"
                    step="0.01"
                    value={newShow.regularPrice}
                    onChange={(e) =>
                      setNewShow((prev) => ({
                        ...prev,
                        regularPrice: e.target.value,
                      }))
                    }
                    className="bg-input border-border"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateShow} className="flex-1">
                  Create Show
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Shows Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Current Shows</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Movie</TableHead>
                <TableHead>Screen</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shows.map((show) => {
                const occupancyPercentage = Math.round(
                  (show.bookedSeats / show.totalSeats) * 100
                );
                return (
                  <TableRow key={show.id} className="border-border">
                    <TableCell className="font-medium">{show.movie}</TableCell>
                    <TableCell>{show.screen}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(show.date)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {show.time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Premium: ₹{show.pricing.premium}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          Regular: ₹{show.pricing.regular}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div
                          className={`text-sm font-medium ${getOccupancyColor(occupancyPercentage)}`}
                        >
                          {occupancyPercentage}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {show.bookedSeats}/{show.totalSeats} seats
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(show.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

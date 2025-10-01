"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Search, User, Menu, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3 md:gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                S
              </span>
            </div>
            <span className="text-2xl font-bold text-foreground">
              ScreenLease
            </span>
          </Link>

          {/* Location + Search */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="Bengaluru">
                <SelectTrigger size="sm" className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bengaluru">Bengaluru</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Delhi / NCR">Delhi / NCR</SelectItem>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                  <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="Kolkata">Kolkata</SelectItem>
                  <SelectItem value="Pune">Pune</SelectItem>
                  <SelectItem value="Ahmedabad">Ahmedabad</SelectItem>
                  <SelectItem value="Kochi">Kochi</SelectItem>
                  <SelectItem value="Jaipur">Jaipur</SelectItem>
                  <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                  <SelectItem value="Lucknow">Lucknow</SelectItem>
                  <SelectItem value="Nagpur">Nagpur</SelectItem>
                  <SelectItem value="Indore">Indore</SelectItem>
                  <SelectItem value="Bhopal">Bhopal</SelectItem>
                  <SelectItem value="Visakhapatnam">Visakhapatnam</SelectItem>
                  <SelectItem value="Surat">Surat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for movies, theatres..."
                className="pl-9 w-full"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline text-sm">
                      Hi,{" "}
                      {user.fullName || user.email || user.phone || "Customer"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-foreground">
                      {user.fullName || "Your account"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email || user.phone}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === "super-admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/super-admin">
                        <Settings className="mr-2 h-4 w-4" />
                        Super Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="hidden sm:flex bg-primary hover:bg-primary/90">
                  Sign In
                </Button>
              </Link>
            )}

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

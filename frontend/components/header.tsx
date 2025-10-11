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
import {
  MapPin,
  Search,
  User,
  Menu,
  LogOut,
  Settings,
  Home,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/components/customer/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-[2000]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3 md:gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <Image
              src="/BooknWatch - Icon.png"
              alt="BookNWatch Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-2xl font-bold text-foreground">
              BooknWatch
            </span>
          </Link>

          {/* Location + Search */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Select
                defaultValue={
                  (typeof window !== "undefined" &&
                    localStorage.getItem("app_city")) ||
                  "Mumbai"
                }
                onValueChange={(value) => {
                  try {
                    if (typeof window !== "undefined") {
                      localStorage.setItem("app_city", value);
                      window.dispatchEvent(
                        new CustomEvent("city-change", { detail: value })
                      );
                    }
                  } catch {}
                }}
              >
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
            {/* Theme Toggle */}
            <ThemeToggle />

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
                <DropdownMenuContent align="end" className="w-64 z-[2100]">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-foreground">
                      {user.fullName || "Your account"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email || user.phone}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push("/orders")}>
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/profile")}>
                    Profile
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

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 z-[2200]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-sm font-medium">Theme</span>
                    <ThemeToggle />
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => router.push("/")}
                  >
                    <Home className="mr-2 h-4 w-4" /> Home
                  </Button>
                  {user ? (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => router.push("/orders")}
                      >
                        My Orders
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => router.push("/profile")}
                      >
                        Profile
                      </Button>
                      {user.role === "admin" && (
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => router.push("/admin")}
                        >
                          <Settings className="mr-2 h-4 w-4" /> Admin Dashboard
                        </Button>
                      )}
                      {user.role === "super-admin" && (
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => router.push("/super-admin")}
                        >
                          <Settings className="mr-2 h-4 w-4" /> Super Admin
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        className="w-full justify-start"
                        onClick={logout}
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => router.push("/login")}
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Settings, User, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/components/customer/auth-provider";

export function SuperAdminHeader() {
  const { logout } = useAuth();
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Role */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  S
                </span>
              </div>
              <span className="text-2xl font-bold text-foreground">
                ScreenLease
              </span>
            </div>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              <Shield className="h-3 w-3 mr-1" />
              Super Admin
            </Badge>
          </div>

          {/* Platform Stats */}
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="font-semibold text-primary">24</div>
              <div className="text-muted-foreground">Venues</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-primary">156</div>
              <div className="text-muted-foreground">Screens</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-primary">₹45.2K</div>
              <div className="text-muted-foreground">Revenue</div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-secondary">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Platform Admin</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={logout}
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

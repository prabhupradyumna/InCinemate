"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSidebar } from "@/components/layout/sidebar-context";
import { Button } from "@/components/ui/button";
import { Bell, Menu, Search, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/components/customer/auth-provider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function AppHeader() {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { logout, user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 991)
      toggleSidebar();
    else toggleMobileSidebar();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex flex-col lg:flex-row lg:px-6">
        <div className="flex w-full items-center justify-between gap-2 px-3 py-3 lg:justify-normal lg:px-0 lg:py-4">
          {/* Left: sidebar toggles (mobile + desktop) */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-lg hover:bg-secondary"
              onClick={handleToggle}
              aria-label="Toggle sidebar (mobile)"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex rounded-lg hover:bg-secondary"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar (desktop)"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <Link href="/" className="lg:hidden">
            <span className="text-xl font-bold">ScreenLease</span>
          </Link>

          <button
            onClick={() => setApplicationMenuOpen((s) => !s)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Quick menu"
          >
            <Search className="h-5 w-5" />
          </button>

          <div className="hidden lg:flex lg:flex-1 lg:items-center">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4" />
              </span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search or type command..."
                className="h-10 w-[420px] rounded-md border border-border bg-background pl-10 pr-3 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div
          className={`${isApplicationMenuOpen ? "flex" : "hidden"} items-center justify-between gap-4 px-5 py-4 lg:flex lg:justify-end lg:px-0`}
        >
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Settings">
              <Settings className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {user?.email ?? "Guest"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
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

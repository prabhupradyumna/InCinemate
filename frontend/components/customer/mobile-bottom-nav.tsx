"use client";

import { Film, Ticket, User, Play } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/customer/auth-provider";

export function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  // Define tabs based on user role and login status
  const getTabs = () => {
    if (!user) {
      // Non-login viewers: only Movies and Trailers
      return [
        { id: "movies", label: "Movies", icon: Film, path: "/" },
        { id: "trailers", label: "Trailers", icon: Play, path: "/trailers" }
      ];
    } else if (user.role === "admin" || user.role === "super-admin") {
      // Admin/Super-admin: Movies, Trailers, and Profile
      return [
        { id: "movies", label: "Movies", icon: Film, path: "/" },
        { id: "trailers", label: "Trailers", icon: Play, path: "/trailers" },
        { id: "profile", label: "Profile", icon: User, path: "/profile" }
      ];
    } else {
      // Regular customers: Movies and Trailers only
      return [
        { id: "movies", label: "Movies", icon: Film, path: "/" },
        { id: "trailers", label: "Trailers", icon: Play, path: "/trailers" }
      ];
    }
  };

  const tabs = getTabs();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${active ? "fill-primary" : ""}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useAuth } from "@/components/auth/auth-provider";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Grid2x2,
  Settings,
  Users,
  LogOut,
  Home,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  onClick?: () => void;
  subItems?: { name: string; path: string; icon?: React.ReactNode }[];
  className?: string;
};

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user, logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const menu: NavItem[] = useMemo(() => {
    if (user?.role === "super-admin") {
      return [
        {
          icon: <Grid2x2 className="h-4 w-4" />,
          name: "Overview",
          path: "/super-admin",
        },
        {
          icon: <Users className="h-4 w-4" />,
          name: "Users",
          path: "/super-admin",
        },
        {
          icon: <Settings className="h-4 w-4" />,
          name: "Settings",
          path: "/super-admin",
        },
        {
          icon: <LogOut className="h-4 w-4" />,
          name: "Log out",
          onClick: logout,
        },
      ];
    }
    if (user?.role === "admin") {
      return [
        {
          icon: <Grid2x2 className="h-4 w-4" />,
          name: "Dashboard",
          path: "/admin",
        },
        {
          icon: <Settings className="h-4 w-4" />,
          name: "Venue Settings",
          path: "/admin",
        },
        {
          icon: <LogOut className="h-4 w-4" />,
          name: "Log out",
          onClick: logout,
        },
      ];
    }
    return [{ icon: <Home className="h-4 w-4" />, name: "Home", path: "/" }];
  }, [user, logout]);

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const isItemExpanded = (name: string) => expandedItems.includes(name);

  const renderItem = (item: NavItem) => {
    const hasSub = item.subItems && item.subItems.length > 0;
    const showText = isExpanded || isHovered || isMobileOpen;
    const isActive = item.path && pathname === item.path;
    return (
      <li key={item.name}>
        {hasSub ? (
          <button
            className={`menu-item group w-full text-left ${isActive ? "menu-item-active" : ""}`}
            onClick={() => toggleExpanded(item.name)}
          >
            <span className="menu-item-icon-size">{item.icon}</span>
            {showText && (
              <>
                <span className="menu-item-text">{item.name}</span>
                <span className="ml-auto">
                  {isItemExpanded(item.name) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </span>
              </>
            )}
          </button>
        ) : item.path ? (
          <Link
            href={item.path}
            className={`menu-item group ${isActive ? "menu-item-active" : ""} ${item.className || ""}`}
          >
            <span className="menu-item-icon-size">{item.icon}</span>
            {showText && <span className="menu-item-text">{item.name}</span>}
          </Link>
        ) : (
          <button
            className={`menu-item group w-full text-left ${item.className || ""}`}
            onClick={item.onClick}
          >
            <span className="menu-item-icon-size">{item.icon}</span>
            {showText && <span className="menu-item-text">{item.name}</span>}
          </button>
        )}

        {hasSub && isItemExpanded(item.name) && showText && (
          <ul className="ml-6 mt-2 space-y-1">
            {item.subItems!.map((s) => (
              <li key={s.name}>
                <Link href={s.path} className="menu-item group text-sm">
                  <span className="menu-item-icon-size">
                    {s.icon ?? <ChevronRight className="h-3 w-3" />}
                  </span>
                  <span className="menu-item-text">{s.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-screen border-r border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 transition-all duration-300 ease-in-out lg:mt-0 ${
        isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-5 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"} flex`}
      >
        <Link
          href={
            user?.role === "super-admin"
              ? "/super-admin"
              : user?.role === "admin"
                ? "/admin"
                : "/"
          }
        >
          <span className="px-4 text-xl font-bold">
            {isExpanded || isHovered || isMobileOpen ? "ScreenLease" : "S"}
          </span>
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto">
        <nav className="mb-6">
          <ul className="flex flex-col gap-1 px-2">{menu.map(renderItem)}</ul>
        </nav>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useAuth } from "@/components/customer/auth-provider";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Grid2x2,
  Settings,
  Users,
  LogOut,
  Home,
  Building2,
  BarChart3,
  FileText,
  Shield,
  Wrench,
  Film,
  Plus,
  Calendar,
  Square,
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
          name: "User Management",
          subItems: [
            {
              name: "Admins",
              path: "/super-admin?tab=users",
              icon: <Shield className="h-3 w-3" />,
            },
            {
              name: "Customers",
              path: "/super-admin?tab=customers",
              icon: <Users className="h-3 w-3" />,
            },
          ],
        },
        {
          icon: <Building2 className="h-4 w-4" />,
          name: "Venue Management",
          subItems: [
            {
              name: "All Venues",
              path: "/super-admin?tab=venues",
              icon: <Building2 className="h-3 w-3" />,
            },
            {
              name: "Auditorium Requests",
              path: "/super-admin?tab=auditorium-requests",
              icon: <FileText className="h-3 w-3" />,
            },
            {
              name: "Auditorium Builder",
              path: "/super-admin?tab=auditorium-builder",
              icon: <Wrench className="h-3 w-3" />,
            },
          ],
        },
        {
          icon: <Film className="h-4 w-4" />,
          name: "Movie Management",
          subItems: [
            {
              name: "All Movies",
              path: "/super-admin/movies",
              icon: <Film className="h-3 w-3" />,
            },
            {
              name: "Create Movie",
              path: "/super-admin/movies/add",
              icon: <Plus className="h-3 w-3" />,
            },
          ],
        },
        {
          icon: <Calendar className="h-4 w-4" />,
          name: "Shows Management",
          path: "/super-admin?tab=shows",
        },
        {
          icon: <Settings className="h-4 w-4" />,
          name: "Settings",
          path: "/super-admin?tab=settings",
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
          icon: <Settings className="h-4 w-4" />,
          name: "Customer Requests",
          path: "/admin?tab=customer-requests",
        },
        {
          icon: <Square className="h-4 w-4" />,
          name: "Booked Seats",
          path: "/admin?tab=booked-seats",
        },
        {
          icon: <LogOut className="h-4 w-4" />,
          name: "Log out",
          onClick: logout,
        },
        { icon: <Home className="h-4 w-4" />,
          name: "Home",
          path: "/",
        }
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
          className="flex items-center space-x-2 px-4"
        >
          <Image
            src="/BooknWatch - Icon.png"
            alt="BookNWatch Logo"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="text-xl font-bold text-foreground">
              BooknWatch
            </span>
          )}
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

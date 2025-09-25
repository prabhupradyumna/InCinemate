"use client";

import type React from "react";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";
import AppSidebar from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";
import Backdrop from "@/components/layout/Backdrop";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminShellContent>{children}</AdminShellContent>
    </SidebarProvider>
  );
}

function AdminShellContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const expanded = isExpanded || isHovered;
  const desktopMargin = expanded ? "lg:ml-[290px]" : "lg:ml-[90px]";
  const mobileMargin = isMobileOpen ? "ml-0" : "";
  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${desktopMargin} ${mobileMargin}`}
      >
        <AppHeader />
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
